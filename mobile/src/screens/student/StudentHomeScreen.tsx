import React, { useState, useCallback } from 'react';
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

export default function StudentHomeScreen() {
  const navigation = useNavigation<any>();
  const { data: classes = [] } = useStudentClasses();
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

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
        renderItem={({ item }) => (
          <ClassCard
            title={item.name}
            description={item.description}
            isAttendanceActive={item.isAttendanceActive}
            isRegistered={registeredIds.has(item.id)}
            onPress={() =>
              navigation.navigate('StudentClassDetails', {
                classId: item.id,
              })
            }
            onRegisterPresence={() => {
              console.log(`Registrando presença na turma: ${item.name}`);
              setRegisteredIds(prev => new Set(prev).add(item.id));
            }}
          />
        )}
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
