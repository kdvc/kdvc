import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  useProfessorClassStudents,
  useProfessorAttendanceHistory,
} from '../../hooks/useProfessorClassDetails';
import { AddStudentModal } from '../../components/AddStudentModal';
import { AttendanceModal } from '../../components/AttendanceModal';
import { useAddStudents } from '../../hooks/useAddStudents';
import { useRemoveCourse } from '../../hooks/useRemoveCourse';
import { useRemoveStudent } from '../../hooks/useRemoveStudent';
import { ExportService } from '../../services/exportService';
import { EditCourseModal } from '../../components/EditCourseModal';
import { apiFetch } from '../../services/api';
import { useStartAttendance } from '../../domain/bluetooth/useStartAttendance';

type TabType = 'students' | 'attendance';

export default function ClassDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { discipline } = route.params || {};
  const [activeTab, setActiveTab] = useState<TabType>('students');

  const { data: classStudents = [] } = useProfessorClassStudents(
    discipline?.id ?? '',
  );
  const { data: attendanceHistory = [], refetch: refetchHistory } =
    useProfessorAttendanceHistory(discipline?.id ?? '');

  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [currentClassId, setCurrentClassId] = useState<string>('');
  const [currentClassTopic, setCurrentClassTopic] = useState<string>('');
  const [studentsForAttendance, setStudentsForAttendance] = useState<any[]>([]);
  const [editCourseModalVisible, setEditCourseModalVisible] = useState(false);
  const [currentDiscipline, setCurrentDiscipline] = useState<any>(discipline);

  const { mutate: addStudents, isPending: isAddingStudents } = useAddStudents();
  const { mutate: removeCourse } = useRemoveCourse();
  const { mutate: removeStudent } = useRemoveStudent();
  const { startAttendance, stopAttendance } = useStartAttendance();

  // Polling a cada 3s enquanto modal de chamada está aberto
  useEffect(() => {
    if (!attendanceModalVisible || !currentClassId) return;

    const interval = setInterval(async () => {
      try {
        const classDetails = await apiFetch<any>(`/classes/${currentClassId}`);
        const currentAttendance = classDetails.attendances || [];

        const studentList = classStudents.map((s: any) => ({
          ...s,
          present: currentAttendance.some((a: any) => a.studentId === s.id),
        }));

        setStudentsForAttendance(studentList);
      } catch (error) {
        console.warn('Polling attendance failed in ClassDetailsScreen:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [attendanceModalVisible, currentClassId, classStudents]);

  const handleAddStudents = (emails: string[]) => {
    addStudents(
      { courseId: discipline?.id, emails },
      {
        onSuccess: () => {
          Alert.alert('Sucesso', 'Alunos adicionados com sucesso!');
          setAddStudentModalVisible(false);
        },
        onError: () => {
          Alert.alert('Erro', 'Não foi possível adicionar os alunos.');
        },
      },
    );
  };

  const handleRemoveCourse = () => {
    Alert.alert(
      'Excluir Turma',
      `Tem certeza que deseja apagar a turma "${discipline?.name}" inteira? Esta ação não pode ser desfeita e todas as presenças serão perdidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            removeCourse(discipline.id, {
              onSuccess: () => {
                navigation.goBack();
              },
              onError: () => {
                Alert.alert('Erro', 'Não foi possível excluir a turma.');
              },
            });
          },
        },
      ]
    );
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    Alert.alert(
      'Remover Aluno',
      `Deseja realmente remover o aluno(a) ${studentName} desta turma?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            removeStudent(
              { courseId: discipline.id, studentId },
              {
                onError: () => {
                  Alert.alert('Erro', 'Não foi possível remover o aluno.');
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      const courseName = currentDiscipline?.name || 'Turma';
      const csvContent = ExportService.generateCourseSummaryCSV(
        courseName,
        classStudents,
        attendanceHistory,
      );
      const safeName = (currentDiscipline?.name || 'turma')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `relatorio_${safeName}.csv`;
      const title = `Relatório de Chamada - ${currentDiscipline?.name || 'Turma'}`;

      await ExportService.exportToCSV(csvContent, filename, title);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleEditAttendance = async (classId: string) => {
    try {
      const classDetails = await apiFetch<any>(`/classes/${classId}`);
      const currentAttendance = classDetails.attendances || [];

      const studentList = classStudents.map((s: any) => ({
        ...s,
        present: currentAttendance.some((a: any) => a.studentId === s.id),
      }));

      setStudentsForAttendance(studentList);
      setCurrentClassId(classId);
      setCurrentClassTopic(classDetails.topic || '');

      // Do NOT start BLE broadcasting for edits
      setAttendanceModalVisible(true);
    } catch (error) {
      console.error('Failed to load class attendance', error);
      Alert.alert('Erro', 'Não foi possível carregar a chamada.');
    }
  };

  const handleReopenAttendance = async (classId: string) => {
    try {
      // Pull the current details
      const classDetails = await apiFetch<any>(`/classes/${classId}`);

      // Update the class date to NOW so it becomes the legitimate 'activeClass' for the course
      await apiFetch(`/classes/${classId}`, {
        method: 'PATCH',
        body: JSON.stringify({ date: new Date().toISOString() }),
      });

      const currentAttendance = classDetails.attendances || [];

      const studentList = classStudents.map((s: any) => ({
        ...s,
        present: currentAttendance.some((a: any) => a.studentId === s.id),
      }));

      setStudentsForAttendance(studentList);
      setCurrentClassId(classId);
      setCurrentClassTopic(classDetails.topic || '');

      const btOk = await startAttendance(classId);
      if (btOk) {
        setAttendanceModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to reopen class attendance', error);
      Alert.alert('Erro', 'Não foi possível reabrir a chamada.');
    }
  };

  const handleSetPresence = async (studentId: string, present: boolean) => {
    // Optimistic update
    setStudentsForAttendance(prevStudents =>
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
      setStudentsForAttendance(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId
            ? { ...student, present: !present }
            : student,
        ),
      );
      Alert.alert('Erro', 'Não foi possível registrar a presença.');
    }
  };

  const handleRemoveAttendance = (attendanceClassId: string) => {
    Alert.alert(
      'Excluir Chamada',
      'Tem certeza de que deseja excluir esta chamada? Isso removerá a lista de presença associada a ela e não pode ser desfeito.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/classes/${attendanceClassId}`, {
                method: 'DELETE',
              });
              refetchHistory();
            } catch (error) {
              console.error('Failed to delete attendance', error);
              Alert.alert('Erro', 'Não foi possível excluir a chamada.');
            }
          },
        },
      ],
    );
  };

  const handleCloseAttendanceModal = () => {
    setAttendanceModalVisible(false);
    stopAttendance();
    refetchHistory(); // Refresh the list to show updated counts
  };

  const handleExportAttendance = async (attendanceId: string) => {
    try {
      const attendanceItem = attendanceHistory.find(
        (a: any) => a.id === attendanceId,
      );
      if (!attendanceItem) return;

      const courseName = currentDiscipline?.name || 'Turma';
      const csvContent = ExportService.generateAttendanceCSV(
        courseName,
        classStudents,
        attendanceItem,
      );
      const safeName = (currentDiscipline?.name || 'turma')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `chamada_${safeName}_${attendanceItem.date.replace(
        /\//g,
        '-',
      )}.csv`;
      const title = `Chamada - ${currentDiscipline?.name} - ${attendanceItem.date}`;

      await ExportService.exportToCSV(csvContent, filename, title);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const truncate = (str: string | undefined, max: number) => {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color="#4F378B" />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {truncate(currentDiscipline?.name || 'Detalhes da Turma', 20)}
        </Text>
      </View>
      <View style={styles.headerRightActions}>
        <TouchableOpacity onPress={() => setEditCourseModalVisible(true)} style={styles.backButton}>
          <Icon name="edit" size={24} color="#4F378B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleExport} style={styles.backButton}>
          <Icon name="share" size={24} color="#4F378B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRemoveCourse} style={styles.backButton}>
          <Icon name="delete" size={24} color="#EA1D2C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'students' && styles.activeTab]}
        onPress={() => setActiveTab('students')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'students' && styles.activeTabText,
          ]}
        >
          Alunos ({classStudents.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'attendance' && styles.activeTab,
        ]}
        onPress={() => setActiveTab('attendance')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'attendance' && styles.activeTabText,
          ]}
        >
          Chamadas
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStudentsList = () => (
    <FlatList
      data={classStudents}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.studentItem}>
          <View style={styles.avatarPlaceholder}>
            {item.profilePicture ? (
              <Image source={{ uri: item.profilePicture }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            ) : (
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentId}>
              Matrícula: {item.enrollmentId || 'N/A'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteStudentButton}
            onPress={() => handleRemoveStudent(item.id, item.name)}
          >
            <Icon name="delete" size={22} color="#EA1D2C" />
          </TouchableOpacity>
        </View>
      )}
    />
  );

  const renderAttendanceList = () => (
    <FlatList
      data={attendanceHistory}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.attendanceItem}>
          <View style={styles.attendanceContent}>
            <View style={styles.attendanceHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.attendanceDate} numberOfLines={1} ellipsizeMode="tail">{truncate(item.topic || 'Chamada', 18)}</Text>
                <Text style={styles.attendanceTopic}>{item.date}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Finalizada</Text>
              </View>
            </View>

            <View style={styles.attendanceStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Presença</Text>
                <Text style={styles.statValue}>
                  {item.presentCount}/{classStudents.length}
                </Text>
              </View>
              <View style={styles.attendanceBar}>
                <View
                  style={[
                    styles.attendanceProgress,
                    {
                      width: `${classStudents.length > 0
                        ? (item.presentCount / classStudents.length) * 100
                        : 0
                        }%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReopenAttendance(item.classId)}
            >
              <Icon
                name="settings-input-antenna"
                size={20}
                color="#4F378B"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.actionButtonText, { color: '#4F378B' }]}>
                Reabrir
              </Text>
            </TouchableOpacity>

            <View style={styles.verticalSeparator} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditAttendance(item.classId)} // use classId from useProfessorAttendanceHistory mapping
            >
              <Icon
                name="edit"
                size={20}
                color="#4F378B"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.actionButtonText, { color: '#4F378B' }]}>
                Editar
              </Text>
            </TouchableOpacity>

            <View style={styles.verticalSeparator} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleExportAttendance(item.id)}
            >
              <Icon
                name="download"
                size={20}
                color="#EA1D2C"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.actionButtonText}>Exportar</Text>
            </TouchableOpacity>

            <View style={styles.verticalSeparator} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRemoveAttendance(item.classId)}
            >
              <Icon
                name="delete"
                size={20}
                color="#EA1D2C"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.actionButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      <View style={styles.content}>
        {activeTab === 'students'
          ? renderStudentsList()
          : renderAttendanceList()}
      </View>

      {activeTab === 'students' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setAddStudentModalVisible(true)}
        >
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <AddStudentModal
        visible={addStudentModalVisible}
        onClose={() => setAddStudentModalVisible(false)}
        onAdd={handleAddStudents}
        isLoading={isAddingStudents}
      />

      <AttendanceModal
        visible={attendanceModalVisible}
        disciplineName={currentDiscipline?.name || ''}
        classTopic={currentClassTopic}
        students={studentsForAttendance}
        onClose={handleCloseAttendanceModal}
        onSetPresence={handleSetPresence}
        onUpdateTopic={async (newTopic) => {
          try {
            await apiFetch(`/classes/${currentClassId}`, {
              method: 'PATCH',
              body: JSON.stringify({ topic: newTopic }),
            });
            setCurrentClassTopic(newTopic);
            refetchHistory();
          } catch (error) {
            console.error('Failed to update topic', error);
          }
        }}
      />

      <EditCourseModal
        visible={editCourseModalVisible}
        onClose={() => setEditCourseModalVisible(false)}
        course={currentDiscipline}
        onSaveSuccess={(updated) => {
          setCurrentDiscipline((prev: any) => ({ ...prev, ...updated }));
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  headerRightActions: {
    flexDirection: 'row',
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
    borderBottomColor: '#4F378B', // Changed to match theme
  },
  tabText: {
    fontSize: 14,
    color: '#717171',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4F378B', // Changed to match theme
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3E3E3E',
  },
  deleteStudentButton: {
    padding: 8,
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
  attendanceTopic: {
    fontSize: 12,
    color: '#757575',
    flex: 1,
    marginLeft: 8,
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
    backgroundColor: '#26A65B',
    borderRadius: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly', // Distribute buttons evenly
  },
  actionButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
  },
  verticalSeparator: {
    width: 1,
    height: '60%',
    backgroundColor: '#F0F0F0',
  },
  actionButtonText: {
    color: '#EA1D2C',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: '#4F378B',
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
