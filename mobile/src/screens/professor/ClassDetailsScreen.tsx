import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';

interface Student {
    id: string;
    name: string;
    enrollmentId: string;
}

interface AttendanceRecord {
    id: string;
    date: string;
    presentCount: number;
    totalCount: number;
}

const mockStudents: Student[] = [
    { id: '1', name: 'Ana Silva', enrollmentId: '2023001' },
    { id: '2', name: 'Bruno Santos', enrollmentId: '2023002' },
    { id: '3', name: 'Carla Oliveira', enrollmentId: '2023003' },
    { id: '4', name: 'Daniel Souza', enrollmentId: '2023004' },
    { id: '5', name: 'Eduarda Costa', enrollmentId: '2023005' },
    { id: '6', name: 'Felipe Lima', enrollmentId: '2023006' },
    { id: '7', name: 'Gabriela Rocha', enrollmentId: '2023007' },
];

const mockAttendanceHistory: AttendanceRecord[] = [
    { id: '1', date: '07/02/2026', presentCount: 45, totalCount: 50 },
    { id: '2', date: '05/02/2026', presentCount: 48, totalCount: 50 },
    { id: '3', date: '03/02/2026', presentCount: 42, totalCount: 50 },
    { id: '4', date: '31/01/2026', presentCount: 49, totalCount: 50 },
];

type TabType = 'students' | 'attendance';

export default function ClassDetailsScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { discipline } = route.params || {};
    const [activeTab, setActiveTab] = useState<TabType>('students');

    // const renderHeader = () => (
    //     <View style={styles.header}>
    //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
    //             <Text style={styles.backButtonText}>← Voltar</Text>
    //         </TouchableOpacity>
    //         <Text style={styles.title}>{discipline?.name || 'Detalhes da Turma'}</Text>
    //         <Text style={styles.subtitle}>{discipline?.schedule || ''}</Text>
    //     </View>
    // );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'students' && styles.activeTab]}
                onPress={() => setActiveTab('students')}
            >
                <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>Alunos</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'attendance' && styles.activeTab]}
                onPress={() => setActiveTab('attendance')}
            >
                <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>Presenças</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStudentsList = () => (
        <FlatList
            data={mockStudents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.studentItem}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    </View>
                    <View>
                        <Text style={styles.studentName}>{item.name}</Text>
                        <Text style={styles.studentId}>Matrícula: {item.enrollmentId}</Text>
                    </View>
                </View>
            )}
            contentContainerStyle={styles.listContent}
        />
    );

    const renderAttendanceList = () => (
        <FlatList
            data={mockAttendanceHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.attendanceItem}>
                    <Text style={styles.attendanceDate}>{item.date}</Text>
                    <View style={styles.attendanceStats}>
                        <Text style={styles.statText}>
                            <Text style={styles.statLabel}>Presentes:</Text> {item.presentCount}/{item.totalCount}
                        </Text>
                        <View style={styles.attendanceBar}>
                            <View
                                style={[
                                    styles.attendanceProgress,
                                    { width: `${(item.presentCount / item.totalCount) * 100}%` }
                                ]}
                            />
                        </View>
                    </View>
                </View>
            )}
            contentContainerStyle={styles.listContent}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* {renderHeader()} */}
            {renderTabs()}
            <View style={styles.content}>
                {activeTab === 'students' ? renderStudentsList() : renderAttendanceList()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        color: '#1976D2',
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#1976D2',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#1976D2',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: 20,
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1976D2',
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    studentId: {
        fontSize: 14,
        color: '#888',
    },
    attendanceItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    attendanceDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    attendanceStats: {
        width: '100%',
    },
    statText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    statLabel: {
        fontWeight: 'bold',
        color: '#444',
    },
    attendanceBar: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    attendanceProgress: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 3,
    },
});
