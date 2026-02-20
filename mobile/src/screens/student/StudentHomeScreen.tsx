import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/StudentHomeHeader';
import { ClassCard } from '../../components/ClassCard';
import { ProfileModal } from '../../components/ProfileModal';
import { useNavigation } from '@react-navigation/native';
import { useStudentClasses } from '../../hooks/useStudentClasses';
import { apiFetch } from '../../services/api';
import { getCurrentUser, updateCurrentUser } from '../../services/authStore';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { useScanner } from '../../domain/bluetooth/useScanner';
import { INDENTIFIER } from '../../domain/bluetooth/types';
import { stringify as uuidStringify } from 'uuid';

export default function StudentHomeScreen() {
  const navigation = useNavigation<any>();
  const { data: classes = [] } = useStudentClasses();
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  // BLE scan
  const { allowed } = usePermissions();
  const { devices, startScan } = useScanner({ allowed });
  const [courseClassMap, setCourseClassMap] = useState<Record<string, string>>(
    {},
  );
  const lastSeenRef = useRef<Record<string, number>>({}); // classId -> timestamp
  const courseMapRef = useRef<Record<string, string>>({}); // classId -> courseId (cache de resolução)

  // Iniciar scan automaticamente quando permitido
  useEffect(() => {
    if (allowed) {
      startScan();
    }
  }, [allowed, startScan]);

  // Extrair classIds dos devices encontrados, resolver courseId e atualizar TTL
  useEffect(() => {
    for (const device of devices) {
      if (
        device.manufacturerData &&
        device.manufacturerData.length === 17 &&
        device.manufacturerId === INDENTIFIER
      ) {
        try {
          const classId = uuidStringify(
            new Uint8Array(device.manufacturerData.slice(1)),
          );

          console.log(
            '[BLE Scan] Device encontrado | classId:',
            classId,
            '| address:',
            device.address,
          );

          // Atualizar timestamp de última vez que vimos esse classId
          lastSeenRef.current[classId] = Date.now();

          // Se já resolvemos o courseId, atualizar o map direto
          if (courseMapRef.current[classId]) {
            const courseId = courseMapRef.current[classId];
            setCourseClassMap(prev => ({
              ...prev,
              [courseId]: classId,
            }));
          } else {
            // Resolver courseId pela primeira vez
            apiFetch<any>(`/classes/${classId}`)
              .then(classDetails => {
                if (classDetails.courseId) {
                  courseMapRef.current[classId] = classDetails.courseId;
                  setCourseClassMap(prev => ({
                    ...prev,
                    [classDetails.courseId]: classId,
                  }));
                }
              })
              .catch(err =>
                console.warn('Failed to resolve classId:', classId, err),
              );
          }
        } catch (e) {
          console.warn('Error parsing UUID from BLE device', e);
        }
      }
    }
  }, [devices]);

  // Cleanup: remover entradas que não foram vistas nos últimos 3s
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const TTL = 1000;
      let changed = false;

      const newMap = { ...courseClassMap };
      for (const [courseId, classId] of Object.entries(newMap)) {
        const lastSeen = lastSeenRef.current[classId] || 0;
        if (now - lastSeen > TTL) {
          delete newMap[courseId];
          changed = true;
        }
      }

      if (changed) {
        setCourseClassMap(newMap);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [courseClassMap]);

  const [user, setUser] = useState<any>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [isMandatoryProfileUpdate, setIsMandatoryProfileUpdate] =
    useState(false);

  const fetchUser = useCallback(async () => {
    try {
      // Get user from authStore
      let userData: any = await getCurrentUser();

      if (userData) {
        // Fetch fresh data to check enrollmentId
        try {
          const freshUser = await apiFetch<any>(`/users/${userData.id}`);
          userData = freshUser;
          await updateCurrentUser(freshUser);
        } catch (e) {
          console.log('Failed to refresh user data', e);
        }

        setUser(userData);

        if (!userData.enrollmentId) {
          setIsMandatoryProfileUpdate(true);
          setProfileModalVisible(true);
        } else {
          setIsMandatoryProfileUpdate(false);
          // Only close if it was previously mandatory and now we have ID
          if (profileModalVisible && isMandatoryProfileUpdate) {
            setProfileModalVisible(false);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user', error);
    }
  }, [profileModalVisible, isMandatoryProfileUpdate]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser]),
  );

  const handleProfileSave = (updatedUser: any) => {
    setUser(updatedUser);
    updateCurrentUser(updatedUser); // Update local storage
    if (updatedUser.enrollmentId) {
      setIsMandatoryProfileUpdate(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onOpenProfile={() => setProfileModalVisible(true)} />

      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const activeClassId = courseClassMap[item.id];
          return (
            <ClassCard
              title={item.name}
              description={item.description}
              isAttendanceActive={!!activeClassId}
              isRegistered={registeredIds.has(item.id)}
              onPress={() =>
                navigation.navigate('StudentClassDetails', {
                  classId: item.id,
                })
              }
              onRegisterPresence={async () => {
                if (!activeClassId) return;
                try {
                  console.log(
                    '[Chamada] Registrando presença | classId:',
                    activeClassId,
                  );
                  await apiFetch(`/classes/${activeClassId}/attendance`, {
                    method: 'POST',
                  });
                  console.log('[Chamada] ✅ Presença registrada!');
                  setRegisteredIds(prev => new Set(prev).add(item.id));
                } catch (error) {
                  console.error(
                    '[Chamada] ❌ Erro ao registrar presença:',
                    error,
                  );
                }
              }}
            />
          );
        }}
      />

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        user={user}
        isMandatory={isMandatoryProfileUpdate}
        onSaveSuccess={handleProfileSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7FF',
  },

  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
});
