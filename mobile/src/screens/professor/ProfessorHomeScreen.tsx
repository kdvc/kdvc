import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { DisciplineCard } from '../../components/DisciplineCard';
import { AttendanceModal } from '../../components/AttendanceModal';
import { AddClassModal } from '../../components/AddClassModal';
import { StartClassModal } from '../../components/StartClassModal';
import ProfessorHomeHeader from '../../components/ProfessorHomeHeader';
import { ProfileModal } from '../../components/ProfileModal';
import { useProfessorDisciplines } from '../../hooks/useProfessorDisciplines';
import { useCreateCourse } from '../../hooks/useCreateCourse';
import { apiFetch } from '../../services/api';
import { getCurrentUser } from '../../services/authStore';
import RNFS from 'react-native-fs';
import { useStartAttendance } from '../../domain/bluetooth/useStartAttendance';

const formatSchedule = (schedules: any[]) => {
  if (!schedules || schedules.length === 0) return 'Sem horário';
  const dayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return schedules
    .map(s => `${dayMap[s.dayOfWeek]} ${s.startTime}-${s.endTime}`)
    .join(', ');
};

export default function ProfessorHomeScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [addClassModalVisible, setAddClassModalVisible] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [currentClassId, setCurrentClassId] = useState<string>('');
  const [currentClassTopic, setCurrentClassTopic] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);

  const [startClassModalVisible, setStartClassModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [courseForStart, setCourseForStart] = useState<{ id: string, name: string, activeClassId?: string, lastClassId?: string | null } | null>(null);

  const { data: disciplines = [], refetch, isFetching } = useProfessorDisciplines();
  const { mutateAsync: createCourse } = useCreateCourse();
  const { isAdvertising, startAttendance, stopAttendance } =
    useStartAttendance();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const u = await getCurrentUser();
      if (u) {
        try {
          const fresh = await apiFetch<any>(`/users/${u.id}`);
          setUser(fresh);
        } catch (_e) {
          setUser(u);
        }
      }
    };
    loadUser();
  }, []);
  const [currentCourseId, setCurrentCourseId] = useState<string>('');

  // Global Bluetooth Cleanup: sweep any ghost beacons from previous app crash on mount
  useEffect(() => {
    stopAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling a cada 3s enquanto modal de chamada está aberto
  useEffect(() => {
    if (!modalVisible || !currentClassId || !currentCourseId) return;

    const interval = setInterval(async () => {
      try {
        const classDetails = await apiFetch<any>(`/classes/${currentClassId}`);
        const currentAttendance = classDetails.attendances || [];
        const courseStudents = await apiFetch<any[]>(
          `/courses/${currentCourseId}/students`,
        );
        const studentList = courseStudents.map((s: any) => ({
          ...s,
          present: currentAttendance.some((a: any) => a.studentId === s.id),
        }));
        setStudents(studentList);
      } catch (error) {
        console.warn('Polling attendance failed:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [modalVisible, currentClassId, currentCourseId]);

  const handleStartCall = (
    disciplineId: string,
    disciplineName: string,
    activeClassId?: string,
    lastClassId?: string | null,
  ) => {
    setCourseForStart({ id: disciplineId, name: disciplineName, activeClassId, lastClassId });
    setStartClassModalVisible(true);
  };

  const proceedStartCall = async (topic: string) => {
    if (!courseForStart) return;
    const { id: disciplineId, name: disciplineName } = courseForStart;
    setStartClassModalVisible(false);

    setSelectedDiscipline(disciplineName);
    setCurrentCourseId(disciplineId);

    try {
      const courseStudents = await apiFetch<any[]>(`/courses/${disciplineId}/students`);

      const newClass = await apiFetch<{ id: string }>('/classes', {
        method: 'POST',
        body: JSON.stringify({
          topic: topic || `Chamada - ${disciplineName}`,
          date: new Date().toISOString(),
          courseId: disciplineId,
        }),
      });

      const classId = newClass.id;
      setCurrentClassTopic(topic || `Chamada - ${disciplineName}`);

      queryClient.invalidateQueries({
        queryKey: ['professorDisciplines'],
      });

      if (classId) {
        setCurrentClassId(classId);

        // Start BLE broadcasting
        const btOk = await startAttendance(classId);
        if (!btOk) return;

        const studentList = courseStudents.map((s: any) => ({
          ...s,
          present: false,
        }));

        setStudents(studentList);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to start class session', error);
      Alert.alert('Erro', 'Não foi possível acessar a chamada.');
    }
  };

  const handleSetPresence = async (studentId: string, present: boolean) => {
    // Se o aluno já está no status desejado, não faz nada
    const student = students.find(s => s.id === studentId);
    if (student && student.present === present) return;

    try {
      if (present) {
        await apiFetch(`/classes/${currentClassId}/attendance`, {
          method: 'POST',
          body: JSON.stringify({ studentId }),
        });
      } else {
        await apiFetch(`/classes/${currentClassId}/attendance/${studentId}`, {
          method: 'DELETE',
        });
      }

      setStudents(prevStudents =>
        prevStudents.map(s => (s.id === studentId ? { ...s, present } : s)),
      );
    } catch (error) {
      console.error('Failed to update attendance', error);
      Alert.alert('Erro', 'Não foi possível registrar a presença.');
    }
  };

  const handleAddClass = () => {
    setAddClassModalVisible(true);
  };

  const handleSaveClass = async (data: {
    name: string;
    schedules: { dayOfWeek: number; startTime: string; endTime: string }[];
    file: any;
  }) => {
    try {
      // Read emails from the attached file
      let emails: string[] = [];
      if (data.file?.uri) {
        const content = await RNFS.readFile(data.file.uri, 'utf8');
        emails = content
          .split(/[\n,;]+/)
          .map((e: string) => e.trim())
          .filter((e: string) => e.includes('@'));
      }

      await createCourse({
        name: data.name,
        // description is optional, using name as desc for now or empty? DTO has description?
        // Let's just pass empty description if not collected
        schedules: data.schedules,
        studentEmails: emails,
      });

      setAddClassModalVisible(false);
      Alert.alert('Sucesso', `Turma "${data.name}" criada com sucesso!`);
    } catch (error: any) {
      console.error('Failed to create course', error);
      Alert.alert('Erro', 'Não foi possível criar a turma. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfessorHomeHeader
        onAddClass={handleAddClass}
        userName={user?.displayName || user?.name}
        userPhoto={user?.profilePicture}
        onOpenProfile={() => setProfileModalVisible(true)}
      />

      <FlatList
        data={disciplines}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DisciplineCard
            name={item.name}
            schedule={formatSchedule(item.schedules)}
            isActive={true}
            studentCount={item.studentCount}
            picture={item.picture}
            lastClassId={item.lastClassId}
            onStartCall={(lastClassId) =>
              handleStartCall(item.id, item.name, item.activeClassId, lastClassId)
            }
            hasActiveCall={!!item.activeClassId}
            onPress={() =>
              navigation.navigate('ClassDetails', { discipline: item })
            }
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={['#4F378B']}
          />
        }
      />

      <AttendanceModal
        visible={modalVisible}
        disciplineName={selectedDiscipline}
        classTopic={currentClassTopic}
        students={students}
        onClose={() => {
          setModalVisible(false);
          stopAttendance();
        }}
        onSetPresence={handleSetPresence}
        onUpdateTopic={async (newTopic) => {
          try {
            await apiFetch(`/classes/${currentClassId}`, {
              method: 'PATCH',
              body: JSON.stringify({ topic: newTopic }),
            });
            setCurrentClassTopic(newTopic);
          } catch (error) {
            console.error('Failed to update topic', error);
          }
        }}
      />

      <AddClassModal
        visible={addClassModalVisible}
        onClose={() => setAddClassModalVisible(false)}
        onSave={handleSaveClass}
      />

      <StartClassModal
        visible={startClassModalVisible}
        hasActiveClass={!!courseForStart?.activeClassId}
        onClose={() => setStartClassModalVisible(false)}
        onStartNew={topic => proceedStartCall(topic)}
      />

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        user={user}
        onSaveSuccess={(updatedUser) => setUser(updatedUser)}
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
    paddingTop: 16,
  },
  footerContainer: {
    marginTop: 20,
    marginBottom: 40,
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#4F378B',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
