import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';

interface Student {
  id: string;
  name: string;
  displayName?: string;
  enrollmentId?: string;
  present: boolean;
}

interface AttendanceModalProps {
  visible: boolean;
  disciplineName: string;
  classTopic: string;
  students: Student[];
  onClose: () => void;
  onSetPresence: (studentId: string, present: boolean) => void;
  onUpdateTopic?: (newTopic: string) => void;
  readOnly?: boolean;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  visible,
  disciplineName,
  classTopic,
  students,
  onClose,
  onSetPresence,
  onUpdateTopic,
  readOnly = false,
}) => {
  const [editingTopic, setEditingTopic] = React.useState(classTopic);
  const [searchQuery, setSearchQuery] = React.useState('');
  React.useEffect(() => { setEditingTopic(classTopic); }, [classTopic]);

  const presentCount = students.filter(s => s.present).length;
  const totalCount = students.length;

  const sortedAndFilteredStudents = React.useMemo(() => {
    let result = [...students];
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(lowerQuery) ||
        (s.enrollmentId && s.enrollmentId.toLowerCase().includes(lowerQuery))
      );
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchQuery]);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{disciplineName}</Text>

          <View style={styles.topicContainer}>
            {readOnly ? (
              <Text style={[styles.topicInput, { borderWidth: 0, backgroundColor: 'transparent', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }]}>
                {classTopic || "Chamada"}
              </Text>
            ) : (
              <TextInput
                style={styles.topicInput}
                value={editingTopic}
                onChangeText={setEditingTopic}
                onBlur={() => {
                  if (onUpdateTopic && editingTopic !== classTopic) {
                    onUpdateTopic(editingTopic);
                  }
                }}
                placeholder="Nome da chamada"
                placeholderTextColor="#999"
              />
            )}
          </View>

          <Text style={styles.subtitle}>
            Presença: {presentCount}/{totalCount} alunos
          </Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar aluno..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={sortedAndFilteredStudents}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.studentItem}>
                <View style={styles.studentInfo}>
                  <Text
                    style={[
                      styles.studentName,
                      item.present ? styles.textPresent : styles.textAbsent,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.studentEnrollment}>
                    {item.enrollmentId || 'Sem matrícula'}
                  </Text>
                </View>
                {!readOnly && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.iconButton,
                        item.present
                          ? styles.presentButtonActive
                          : styles.presentButtonInactive,
                      ]}
                      onPress={() => onSetPresence(item.id, true)}
                    >
                      <Text
                        style={[
                          styles.buttonIcon,
                          item.present ? styles.iconActive : styles.iconInactive,
                        ]}
                      >
                        ✓
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.iconButton,
                        !item.present
                          ? styles.absentButtonActive
                          : styles.absentButtonInactive,
                      ]}
                      onPress={() => onSetPresence(item.id, false)}
                    >
                      <Text
                        style={[
                          styles.buttonIcon,
                          !item.present ? styles.iconActive : styles.iconInactive,
                        ]}
                      >
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            style={styles.list}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.textStyle}>Fechar Chamada</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    height: '80%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  topicContainer: {
    width: '100%',
    marginBottom: 12,
  },
  topicInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  list: {
    width: '100%',
  },
  studentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  studentEnrollment: {
    fontSize: 12,
    color: '#666',
  },
  studentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
  },
  presentButtonActive: {
    backgroundColor: '#4CAF50', // Solid Green
    borderColor: '#4CAF50',
  },
  presentButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: '#ccc',
  },
  absentButtonActive: {
    backgroundColor: '#F44336', // Solid Red
    borderColor: '#F44336',
  },
  absentButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: '#ccc',
  },
  iconActive: {
    color: '#fff', // White icon for active state
  },
  iconInactive: {
    color: '#ccc', // Gray icon for inactive state
  },
  buttonIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  textPresent: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  textAbsent: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#4F378B', // Purple to match theme
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 20,
    width: '100%',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
