import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (emails: string[]) => void;
  isLoading?: boolean;
}

const colors = {
  background: '#FEF7FF',
  primary: '#4F378B',
  primaryLight: '#EADDFF',
  surface: '#FFFFFF',
  error: '#B3261E',
  text: '#1D1B20',
  outline: '#79747E',
  inputBackground: '#F5F5F5',
};

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
  onAdd,
  isLoading = false,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);

  const handleAddEmail = () => {
    const trimmedInput = emailInput.trim();
    if (!trimmedInput) return;

    // Split by comma, semicolon, space, or newline
    const newEmails = trimmedInput
      .split(/[\n,;\s]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    // Simple email validation
    const validEmails = newEmails.filter(email => email.includes('@'));
    const invalidEmails = newEmails.filter(email => !email.includes('@'));

    if (invalidEmails.length > 0) {
      Alert.alert(
        'E-mails inválidos',
        `Alguns e-mails não parecem válidos: ${invalidEmails.join(', ')}`,
      );
      return;
    }

    // Add unique emails
    const uniqueEmails = [...new Set([...emails, ...validEmails])];
    setEmails(uniqueEmails);
    setEmailInput('');
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleSubmit = () => {
    if (emails.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um e-mail.');
      return;
    }
    onAdd(emails);
  };

  const handleClose = () => {
    setEmails([]);
    setEmailInput('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.centeredView}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalView}>
            <View style={styles.header}>
              <Text style={styles.title}>Adicionar Alunos</Text>
              <TouchableOpacity onPress={handleClose} disabled={isLoading}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.description}>
                Digite os e-mails dos alunos para adicioná-los à turma.
                Pressione Enter para adicionar.
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="aluno@exemplo.com"
                  value={emailInput}
                  onChangeText={setEmailInput}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="done"
                  onSubmitEditing={handleAddEmail}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={styles.addButtonIcon}
                  onPress={handleAddEmail}
                >
                  <MaterialIcons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.emailList}
                contentContainerStyle={styles.emailListContent}
              >
                <View style={styles.badgesContainer}>
                  {emails.map((email, index) => (
                    <View key={email} style={styles.emailItem}>
                      <Text style={styles.badgeText}>{email}</Text>
                      <TouchableOpacity onPress={() => removeEmail(email)}>
                        <MaterialIcons
                          name="close"
                          size={16}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  emails.length === 0 && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={isLoading || emails.length === 0}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  {isLoading ? 'Adicionando...' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    paddingTop: 200,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardView: {
    width: '100%',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: colors.outline,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  addButtonIcon: {
    padding: 12,
  },
  emailList: {
    flex: 1,
    maxHeight: 200,
  },
  emailListContent: {
    paddingBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F3',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 100,
    marginBottom: 6,
    marginRight: 8, // Added to replace gap
  },
  badgeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.outline,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: colors.primary,
  },
  saveButtonText: {
    color: colors.surface,
  },
});
