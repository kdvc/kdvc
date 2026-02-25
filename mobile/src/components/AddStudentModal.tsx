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
  ActivityIndicator,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import Clipboard from '@react-native-clipboard/clipboard';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (emails: string[]) => void;
  isLoading?: boolean;
  inviteCode?: string | null;
  onRegenerateCode?: () => void;
  isRegenerating?: boolean;
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
  inviteCode,
  onRegenerateCode,
  isRegenerating = false,
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

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await Share.open({
        message: `Entre na minha turma usando o código de convite: ${inviteCode}`,
        title: 'Código de Convite',
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Error sharing code:', error);
      }
    }
  };

  const handleCopyToClipboard = () => {
    if (!inviteCode) return;
    Clipboard.setString(inviteCode);
    Alert.alert('Copiado!', 'O código de convite foi copiado para a área de transferência.', [{ text: 'OK' }]);
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
              <View style={styles.inviteContainer}>
                <View style={styles.inviteHeader}>
                  <Text style={styles.inviteLabel}>Código de Convite</Text>
                </View>
                <View style={styles.inviteBox}>
                  {inviteCode ? (
                    <>
                      <Text style={styles.inviteCodeText}>{inviteCode}</Text>
                      <View style={styles.inviteActions}>
                        <TouchableOpacity onPress={handleCopyToClipboard} style={styles.iconButton}>
                          <MaterialIcons name="content-copy" size={22} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCopyCode} style={styles.iconButton}>
                          <MaterialIcons name="share" size={22} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onRegenerateCode} style={styles.iconButton} disabled={isRegenerating}>
                          {isRegenerating ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                          ) : (
                            <MaterialIcons name="autorenew" size={22} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.emptyInviteText}>Nenhum código gerado</Text>
                      <TouchableOpacity
                        onPress={onRegenerateCode}
                        style={styles.generateButton}
                        disabled={isRegenerating}
                      >
                        {isRegenerating ? (
                          <ActivityIndicator size="small" color={colors.surface} />
                        ) : (
                          <Text style={styles.generateButtonText}>Gerar</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              <Text style={styles.description}>
                Ou digite os e-mails dos alunos para adicioná-los à turma.
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
  inviteContainer: {
    marginBottom: 20,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inviteHeader: {
    marginBottom: 8,
  },
  inviteLabel: {
    fontSize: 14,
    color: colors.outline,
    fontWeight: '600',
  },
  inviteBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  inviteActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  emptyInviteText: {
    fontSize: 14,
    color: colors.outline,
    fontStyle: 'italic',
  },
  generateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  generateButtonText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
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
