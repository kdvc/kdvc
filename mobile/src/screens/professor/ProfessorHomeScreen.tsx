import React, { useState } from 'react';
import { StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DisciplineCard } from '../../components/DisciplineCard';
import { AttendanceModal } from '../../components/AttendanceModal';
import { AddClassModal } from '../../components/AddClassModal';
import ProfessorHomeHeader from '../../components/ProfessorHomeHeader';
import { useProfessorDisciplines } from '../../hooks/useProfessorDisciplines';
import { useProfessorStudents } from '../../hooks/useProfessorStudents';
import type { Student } from '../../services/mockApi';

export default function ProfessorHomeScreen() {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [addClassModalVisible, setAddClassModalVisible] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);

  const { data: disciplines = [] } = useProfessorDisciplines();
  const { data: initialStudents = [] } = useProfessorStudents();

  const handleStartCall = (disciplineName: string) => {
    setSelectedDiscipline(disciplineName);
    // Reset presence for new call
    const resetStudents = initialStudents.map(s => ({ ...s, present: false }));
    setStudents(resetStudents);
    setModalVisible(true);
  };

  const handleSetPresence = (studentId: string, present: boolean) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, present: present } : student,
      ),
    );
  };

  const handleAddClass = () => {
    setAddClassModalVisible(true);
  };

  const handleSaveClass = (data: {
    name: string;
    schedule: string;
    file: any;
  }) => {
    console.log('New Class Data:', data);
    Alert.alert('Sucesso', `Turma "${data.name}" criada com sucesso!`);
    setAddClassModalVisible(false);
  };

  const isClassActive = (schedule: string): boolean => {
    const now = new Date();
    const days = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ];
    const currentDay = days[now.getDay()];

    const parts = schedule.split(' ');
    if (parts.length < 4) return false;

    const scheduleDay = parts[0];

    if (currentDay !== scheduleDay) return false;

    return true;
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
            schedule={item.schedule}
            studentCount={item.studentCount}
            isActive={isClassActive(item.schedule)}
            onStartCall={() => handleStartCall(item.name)}
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
