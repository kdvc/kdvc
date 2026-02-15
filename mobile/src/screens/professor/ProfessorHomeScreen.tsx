import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DisciplineCard } from '../../components/DisciplineCard';
import { AttendanceModal } from '../../components/AttendanceModal';
import { AddClassModal } from '../../components/AddClassModal';
import ProfessorHomeHeader from '../../components/ProfessorHomeHeader';

interface Discipline {
    id: string;
    name: string;
    schedule: string;
    studentCount: number;
}

interface Student {
    id: string;
    name: string;
    present: boolean;
}

const mockDisciplines: Discipline[] = [
    { id: '1', name: 'Matemática Discreta', schedule: 'Segunda 08:00 - 10:00', studentCount: 42 },
    { id: '2', name: 'Cálculo I', schedule: 'Quarta 14:00 - 16:00', studentCount: 35 },
    { id: '3', name: 'Álgebra Linear', schedule: 'Sexta 10:00 - 12:00', studentCount: 28 },
    { id: '4', name: 'Física I', schedule: 'Terça 16:00 - 18:00', studentCount: 30 },
    // Demo class for Thursday night (assuming current time is around 22:00)
    { id: '5', name: 'Projeto Final', schedule: 'Quinta 20:00 - 23:00', studentCount: 15 },
];

const mockStudentsData: Student[] = [
    { id: '1', name: 'Ana Silva', present: false },
    { id: '2', name: 'Bruno Santos', present: false },
    { id: '3', name: 'Carla Oliveira', present: false },
    { id: '4', name: 'Daniel Souza', present: false },
    { id: '5', name: 'Eduarda Costa', present: false },
];

export default function ProfessorHomeScreen() {
    const navigation = useNavigation<any>();
    const [modalVisible, setModalVisible] = useState(false);
    const [addClassModalVisible, setAddClassModalVisible] = useState(false);
    const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
    const [students, setStudents] = useState<Student[]>(mockStudentsData);

    const handleStartCall = (disciplineName: string) => {
        setSelectedDiscipline(disciplineName);
        // Reset presence for new call (optional, based on requirement)
        const resetStudents = mockStudentsData.map(s => ({ ...s, present: false }));
        setStudents(resetStudents);
        setModalVisible(true);
    };

    const handleSetPresence = (studentId: string, present: boolean) => {
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.id === studentId
                    ? { ...student, present: present }
                    : student
            )
        );
    };

    const handleAddClass = () => {
        setAddClassModalVisible(true);
    };

    const handleSaveClass = (data: { name: string; schedule: string; file: any }) => {
        console.log('New Class Data:', data);
        Alert.alert('Sucesso', `Turma "${data.name}" criada com sucesso!`);
        setAddClassModalVisible(false);
        // Here you would typically call an API or update the local list
    };

    const isClassActive = (schedule: string): boolean => {
        const now = new Date();
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const currentDay = days[now.getDay()];

        const parts = schedule.split(' ');
        // Expected format: "Day HH:mm - HH:mm"
        if (parts.length < 4) return false;

        const scheduleDay = parts[0];
        const startTime = parts[1];
        const endTime = parts[3];

        if (currentDay !== scheduleDay) return false;

        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return currentTime >= startTime && currentTime <= endTime;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ProfessorHomeHeader onAddClass={handleAddClass} />

            <FlatList
                data={mockDisciplines}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <DisciplineCard
                        name={item.name}
                        schedule={item.schedule}
                        studentCount={item.studentCount}
                        isActive={isClassActive(item.schedule)}
                        onStartCall={() => handleStartCall(item.name)}
                        onPress={() => navigation.navigate('ClassDetails', { discipline: item })}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                // ListFooterComponent={
                //     <View style={styles.footerContainer}>
                //         <TouchableOpacity
                //             style={styles.actionButton}
                //             onPress={() => navigation.navigate('Bluetooth')}
                //         >
                //             <Text style={styles.buttonText}>Acessar Scanner Bluetooth</Text>
                //         </TouchableOpacity>
                //     </View>
                // }
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
        backgroundColor: '#FEF7FF', // Student background color
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
        backgroundColor: '#4F378B', // Primary Purple
        paddingVertical: 16,
        borderRadius: 100, // Pill shape like Material 3
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
