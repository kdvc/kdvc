import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DisciplineCard } from '../../components/DisciplineCard';
import { AttendanceModal } from '../../components/AttendanceModal';

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

    return (
        <SafeAreaView style={styles.container}>

            <FlatList
                data={mockDisciplines}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <DisciplineCard
                        name={item.name}
                        schedule={item.schedule}
                        studentCount={item.studentCount}
                        onStartCall={() => handleStartCall(item.name)}
                        onPress={() => navigation.navigate('ClassDetails', { discipline: item })}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListFooterComponent={
                    <View style={styles.footerContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.addClassButton]}
                            onPress={() => Alert.alert('Adicionar Turma', 'Funcionalidade de adicionar turma em breve!')}
                        >
                            <Text style={styles.buttonText}>+ Adicionar Turma</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('Bluetooth')}
                        >
                            <Text style={styles.buttonText}>Acessar Scanner Bluetooth</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <AttendanceModal
                visible={modalVisible}
                disciplineName={selectedDiscipline}
                students={students}
                onClose={() => setModalVisible(false)}
                onSetPresence={handleSetPresence}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff', // Light Blue background
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1565C0',
    },
    subtitle: {
        fontSize: 16,
        color: '#0D47A1',
        marginTop: 5,
    },
    listContainer: {
        padding: 20,
        paddingTop: 0,
    },
    footerContainer: {
        marginTop: 10,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
        gap: 15,
    },
    actionButton: {
        backgroundColor: '#1976D2',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    addClassButton: {
        backgroundColor: '#4CAF50', // Green button for adding
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
