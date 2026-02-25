import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';

import PresenceCard from '../../components/PresenceCard';
import { AttendanceModal } from '../../components/AttendanceModal';
import { apiFetch } from '../../services/api';
import { useState } from 'react';
import { useCourseById } from '../../hooks/useClassById';
import { useStudentAttendance } from '../../context/StudentAttendanceContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ClassDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { classId } = route.params;

  const { data: classData, isLoading } = useCourseById(classId);
  const { courseClassMap } = useStudentAttendance();

  // Determine if there's an active attendance for this course dynamically
  const activeClass = courseClassMap[classId];
  const isAttendanceActive = !!activeClass;
  const activeTopic = activeClass?.topic;

  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [studentsForAttendance, setStudentsForAttendance] = useState<any[]>([]);
  const [currentClassTopic, setCurrentClassTopic] = useState<string>('');
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);

  const handleViewAttendance = async (item: any) => {
    try {
      setIsFetchingAttendance(true);
      // Fetch all students for the course
      const courseStudents = await apiFetch<any[]>(`/courses/${classId}/students`);

      // Fetch the full class details to get attendances
      const classDetails = await apiFetch<any>(`/classes/${item.id}`);
      const currentAttendance = classDetails.attendances || [];

      // Map presence
      const studentList = courseStudents.map((s: any) => ({
        ...s,
        present: currentAttendance.some((a: any) => a.studentId === s.id),
      }));

      setStudentsForAttendance(studentList);
      setCurrentClassTopic(classDetails.topic || '');
      setAttendanceModalVisible(true);
    } catch (error) {
      console.error('Failed to view attendance', error);
    } finally {
      setIsFetchingAttendance(false);
    }
  };

  if (isLoading || !classData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F378B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ClassDetailsHeader title={classData.name} navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        {isAttendanceActive ? (
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Icon name="info-outline" size={24} color="#4F378B" />
              <Text style={styles.alertTitle}>Chamada em andamento!</Text>
            </View>
            <Text style={styles.alertText}>
              O professor iniciou uma chamada{activeTopic ? ` sobre "${activeTopic}"` : ''}. Volte para a tela inicial para registrar sua presença.
            </Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => navigation.navigate('StudentHome')}
            >
              <Text style={styles.alertButtonText}>Ir para Início</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Sobre a Turma</Text>
          <Text style={styles.descriptionText}>
            {classData.description || 'Nenhuma descrição disponível para esta turma.'}
          </Text>
        </View>

        {classData.teacher && (
          <View style={styles.teacherSection}>
            <Text style={styles.sectionTitle}>Professor</Text>
            <View style={styles.teacherCard}>
              <View style={styles.teacherAvatar}>
                {classData.teacher.profilePicture ? (
                  <Image source={{ uri: classData.teacher.profilePicture }} style={styles.teacherImage} />
                ) : (
                  <Text style={styles.teacherAvatarText}>
                    {classData.teacher.name ? classData.teacher.name.charAt(0).toUpperCase() : 'T'}
                  </Text>
                )}
              </View>
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>{classData.teacher.name}</Text>
                <Text style={styles.teacherRole}>Professor</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Histórico de Presença</Text>

        <View style={styles.history}>
          {[...classData.classes]
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((item: any) => {
              const dateObj = new Date(item.date);
              const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }) + ' às ' + dateObj.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <PresenceCard
                  key={item.id}
                  date={formattedDate}
                  topic={item.topic}
                  present={item.present}
                  onPress={() => !isFetchingAttendance && handleViewAttendance(item)}
                />
              );
            })}
        </View>
      </ScrollView>

      <AttendanceModal
        visible={attendanceModalVisible}
        disciplineName={classData.name}
        classTopic={currentClassTopic}
        students={studentsForAttendance}
        onClose={() => setAttendanceModalVisible(false)}
        onSetPresence={() => { }} // Disabled in read-only mode
        readOnly={true}
      />
    </SafeAreaView>
  );
}

/* ================== HEADER ================== */

function ClassDetailsHeader({
  title,
  navigation,
}: {
  title: string;
  navigation: any;
}) {
  const truncate = (str: string, max: number) => {
    return str.length > max ? str.substring(0, max) + '...' : str;
  };
  const displayTitle = truncate(title, 25);

  return (
    <View style={headerStyles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={headerStyles.backButton}
      >
        <Icon name="arrow-back" size={24} color="#4F378B" />
      </TouchableOpacity>

      <Text style={headerStyles.title} numberOfLines={1} ellipsizeMode="tail">{displayTitle}</Text>

      <View style={{ width: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7FF',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1B20',
    marginTop: 0,
    marginBottom: 16,
  },
  history: {
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF7FF',
  },
  descriptionSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E0F0',
  },
  descriptionText: {
    fontSize: 14,
    color: '#49454F',
    lineHeight: 20,
  },
  teacherSection: {
    marginBottom: 24,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: 8,
  },
  teacherAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  teacherImage: {
    width: 48,
    height: 48,
  },
  teacherAvatarText: {
    color: '#4F378B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teacherInfo: {
    marginLeft: 12,
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1B20',
  },
  teacherRole: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  alertContainer: {
    backgroundColor: '#EADDFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#21005D',
    marginLeft: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#21005D',
    marginBottom: 16,
    lineHeight: 20,
  },
  alertButton: {
    backgroundColor: '#4F378B',
    borderRadius: 100,
    paddingVertical: 10,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

const headerStyles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FEF7FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 0,
    marginBottom: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1B20',
  },
});
