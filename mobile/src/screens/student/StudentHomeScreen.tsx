import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../components/StudentHomeHeader';
import { ClassCard } from '../../components/ClassCard';
import { ProfileModal } from '../../components/ProfileModal';
import { useNavigation } from '@react-navigation/native';
import { useStudentClasses } from '../../hooks/useStudentClasses';
import { apiFetch } from '../../services/api';
import { getCurrentUser, updateCurrentUser } from '../../services/authStore';
import { useStudentAttendance } from '../../context/StudentAttendanceContext';

export default function StudentHomeScreen() {
  const navigation = useNavigation<any>();
  const { data: classes = [], refetch: refetchClasses, isFetching: isFetchingClasses } = useStudentClasses();
  const { courseClassMap, registeredIds, setRegisteredIds } = useStudentAttendance();
  const userRef = useRef<any>(null);
  // Periodic attendance sync: re-check backend every 5s for all active classes
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      const userId = userRef.current?.id;
      if (!userId) return;

      // Get current active classes from the courseClassMap
      const entries = Object.entries(courseClassMap);
      if (entries.length === 0) return;

      const newRegistered = new Set<string>();
      for (const [courseId, classInfo] of entries) {
        try {
          const classDetails = await apiFetch<any>(`/classes/${classInfo.id}`);
          if (classDetails.attendances) {
            const isPresent = classDetails.attendances.some(
              (a: any) => a.studentId === userId,
            );
            if (isPresent) {
              newRegistered.add(courseId);
            }
          }
        } catch (_e) {
          // ignore
        }
      }

      setRegisteredIds(newRegistered);
    }, 5000);

    return () => clearInterval(syncInterval);
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
        userRef.current = userData;

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
      <Header onOpenProfile={() => setProfileModalVisible(true)} userName={user?.displayName || user?.name} userPhoto={user?.profilePicture} />

      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const activeClass = (courseClassMap && typeof courseClassMap === 'object' && item)
            ? (courseClassMap as any)[item.id]
            : undefined;
          return (
            <ClassCard
              title={item.name}
              description={item.description}
              picture={item.picture}
              isAttendanceActive={!!activeClass}
              activeTopic={activeClass?.topic}
              isRegistered={registeredIds.has(item.id)}
              onPress={() =>
                navigation.navigate('StudentClassDetails', {
                  classId: item.id,
                  isAttendanceActive: !!activeClass,
                  activeTopic: activeClass?.topic,
                })
              }
              onRegisterPresence={async () => {
                if (!activeClass) return;
                try {
                  console.log(
                    '[Chamada] Registrando presença | classId:',
                    activeClass.id,
                  );
                  await apiFetch(`/classes/${activeClass.id}/attendance`, {
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
        refreshControl={
          <RefreshControl
            refreshing={isFetchingClasses}
            onRefresh={refetchClasses}
            colors={['#4F378B']}
          />
        }
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
  },
});
