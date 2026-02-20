import React, { useState } from 'react';
import { StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { DisciplineCard } from '../../components/DisciplineCard';
import { AttendanceModal } from '../../components/AttendanceModal';
import { AddClassModal } from '../../components/AddClassModal';
import ProfessorHomeHeader from '../../components/ProfessorHomeHeader';
import { useProfessorDisciplines } from '../../hooks/useProfessorDisciplines';
import { useCreateCourse } from '../../hooks/useCreateCourse';
import { apiFetch } from '../../services/api';
import RNFS from 'react-native-fs';

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
  const [students, setStudents] = useState<any[]>([]);

  const { data: disciplines = [] } = useProfessorDisciplines();
  const { mutateAsync: createCourse } = useCreateCourse();

  const handleStartCall = async (
    disciplineId: string,
    disciplineName: string,
    existingClassId?: string,
  ) => {
    const isReopening = !!existingClassId;
    const title = isReopening ? 'Reabrir Chamada' : 'Iniciar Chamada';
    const message = isReopening
      ? `Deseja reabrir a chamada de hoje para a turma ${disciplineName}?`
      : `Deseja iniciar a chamada para a turma ${disciplineName}?`;
    const confirmText = isReopening ? 'Reabrir' : 'Iniciar';

    Alert.alert(title, message, [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: confirmText,
        onPress: async () => {
          setSelectedDiscipline(disciplineName);

          try {
            // Fetch fresh list of students for the course to ensure we have everyone
            const courseStudents = await apiFetch<any[]>(
              `/courses/${disciplineId}/students`,
            );

            let classId = existingClassId;
            let currentAttendance: any[] = [];

            if (!classId) {
              // Create new class
              const newClass = await apiFetch<{ id: string }>('/classes', {
                method: 'POST',
                body: JSON.stringify({
                  topic: `Chamada - ${disciplineName}`,
                  date: new Date().toISOString(),
                  courseId: disciplineId,
                }),
              });
              classId = newClass.id;

              // Invalidate queries to update home screen button state
              queryClient.invalidateQueries({
                queryKey: ['professorDisciplines'],
              });
            } else {
              // Fetch existing attendance
              // Assuming GET /classes/:id returns the class with attendances relation
              // based on typical Prisma usage or we have a specific endpoint?
              // Let's check api.ts or just rely on what we can easily add.
              // Ideally: GET /classes/:id includes attendances.
              // If not, we might need GET /classes/:id/attendance (if it exists)
              // Let's try GET /classes/:id first.
              const classDetails = await apiFetch<any>(`/classes/${classId}`);
              currentAttendance = classDetails.attendances || [];
            }

            if (classId) {
              setCurrentClassId(classId);

              // Merge students with attendance
              const studentList = courseStudents.map((s: any) => ({
                ...s,
                present: currentAttendance.some(
                  (a: any) => a.studentId === s.id,
                ),
              }));

              setStudents(studentList);
              setModalVisible(true);
            }
          } catch (error) {
            console.error('Failed to start/open class session', error);
            Alert.alert('Erro', 'Não foi possível acessar a chamada.');
          }
        },
      },
    ]);
  };

  const handleSetPresence = async (studentId: string, present: boolean) => {
    // Optimistic update
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, present } : student,
      ),
    );

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
    } catch (error) {
      console.error('Failed to update attendance', error);
      // Rollback
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId
            ? { ...student, present: !present }
            : student,
        ),
      );
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
      <ProfessorHomeHeader onAddClass={handleAddClass} />

      <FlatList
        data={disciplines}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DisciplineCard
            name={item.name}
            schedule={formatSchedule(item.schedules)}
            isActive={true}
            studentCount={item.studentCount}
            onStartCall={() =>
              handleStartCall(item.id, item.name, item.activeClassId)
            }
            hasActiveCall={!!item.activeClassId}
            onPress={() =>
              navigation.navigate('ClassDetails', { discipline: item })
            }
          />
        )}
        contentContainerStyle={styles.listContainer}
      />

      <AttendanceModal
        visible={modalVisible}
        disciplineName={selectedDiscipline}
        students={students}
        onClose={() => setModalVisible(false)}
        onSetPresence={handleSetPresence}
      />

      <AddClassModal
        visible={addClassModalVisible}
        onClose={() => setAddClassModalVisible(false)}
        onSave={handleSaveClass}
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
    gap: 16,
  },
  footerContainer: {
    marginTop: 20,
    marginBottom: 40,
    width: '100%',
    gap: 16,
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
