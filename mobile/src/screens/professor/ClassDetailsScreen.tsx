import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

    const handleExport = async () => {
        try {
            // Generate CSV Header
            let csvContent = 'Matrícula,Nome,Total de Presenças,Total de Aulas,Percentual\n';

            mockStudents.forEach(student => {
                const totalClasses = 50;
                const presents = Math.floor(Math.random() * 10) + 40;
                const percentage = ((presents / totalClasses) * 100).toFixed(1);

                csvContent += `${student.enrollmentId},${student.name},${presents},${totalClasses},${percentage}%\n`;
            });

            const result = await Share.share({
                message: csvContent,
                title: `Relatório de Chamada - ${discipline?.name || 'Turma'}`,
            });
            if (result.action === Share.sharedAction) {
                // shared
            }
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        }
    };

    const handleExportAttendance = async (attendanceId: string) => {
        try {
            const attendance = mockAttendanceHistory.find(a => a.id === attendanceId);
            if (!attendance) return;

            let csvContent = `Matrícula,Nome,Presença (${attendance.date})\n`;

            mockStudents.forEach(student => {
                const isPresent = Math.random() > 0.1 ? 'Presente' : 'Ausente';
                csvContent += `${student.enrollmentId},${student.name},${isPresent}\n`;
            });

            const result = await Share.share({
                message: csvContent,
                title: `Chamada - ${discipline?.name} - ${attendance.date}`,
            });

            if (result.action === Share.sharedAction) {
                // Shared
            }
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color="#4F378B" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{discipline?.name || 'Detalhes da Turma'}</Text>
            </View>
            <TouchableOpacity onPress={handleExport} style={styles.backButton}>
                <Icon name="share" size={24} color="#4F378B" />
            </TouchableOpacity>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'students' && styles.activeTab]}
                onPress={() => setActiveTab('students')}
            >
                <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>
                    Alunos ({mockStudents.length})
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'attendance' && styles.activeTab]}
                onPress={() => setActiveTab('attendance')}
            >
                <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>
                    Chamadas
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderStudentsList = () => (
        <FlatList
            data={mockStudents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
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
        />
    );

    const renderAttendanceList = () => (
        <FlatList
            data={mockAttendanceHistory}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <View style={styles.attendanceItem}>
                    <View style={styles.attendanceContent}>
                        <View style={styles.attendanceHeader}>
                            <Text style={styles.attendanceDate}>{item.date}</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Finalizada</Text>
                            </View>
                        </View>

                        <View style={styles.attendanceStats}>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Presença</Text>
                                <Text style={styles.statValue}>{item.presentCount}/{item.totalCount}</Text>
                            </View>
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

                    <View style={styles.separator} />

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleExportAttendance(item.id)}
                    >
                        <Text style={styles.actionButtonText}>Exportar Chamada</Text>
                    </TouchableOpacity>
                </View>
            )}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
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
        backgroundColor: '#F5F5F5', // Light grey background
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1D1B20',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#EA1D2C', // iFood Red-ish (or App Primary)
    },
    tabText: {
        fontSize: 14,
        color: '#717171',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#EA1D2C', // iFood Red-ish
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3E3E3E',
    },
    studentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#3E3E3E',
        marginBottom: 2,
    },
    studentId: {
        fontSize: 13,
        color: '#717171',
    },
    attendanceItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 1,
        overflow: 'hidden',
    },
    attendanceContent: {
        padding: 16,
    },
    attendanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    attendanceDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3E3E3E',
    },
    statusBadge: {
        backgroundColor: '#E5F7ED',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#26A65B',
        fontSize: 12,
        fontWeight: 'bold',
    },
    attendanceStats: {
        gap: 8,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#717171',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3E3E3E',
    },
    attendanceBar: {
        height: 8,
        backgroundColor: '#F3F3F3',
        borderRadius: 4,
        width: '100%',
        overflow: 'hidden',
    },
    attendanceProgress: {
        height: '100%',
        backgroundColor: '#26A65B', // Green
        borderRadius: 4,
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    actionButton: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF', // Keep white for a clean look, or light red
    },
    actionButtonText: {
        color: '#EA1D2C', // Primary Action Color
        fontSize: 15,
        fontWeight: 'bold',
    },
});
