import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { apiFetch } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  enrollmentId?: string;
  displayName?: string;
  profilePicture?: string;
}

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user?: User; // Pass the whole user object
  isMandatory?: boolean; // If true, cannot close without saving valid ID
  onSaveSuccess?: (updatedUser: User) => void;
}

const colors = {
  primary: '#4F378B', // Purple
  background: '#FEF7FF',
  white: '#FFFFFF',
  text: '#1D1B20',
  error: '#B3261E',
  disabled: '#E0E0E0',
  placeholder: '#79747E',
};

export const ProfileModal = ({
  visible,
  onClose,
  user,
  isMandatory = false,
  onSaveSuccess,
}: ProfileModalProps) => {
  const [enrollmentId, setEnrollmentId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens or user changes
  useEffect(() => {
    if (visible && user) {
      setEnrollmentId(user.enrollmentId || '');
      setDisplayName(user.displayName || '');
      setProfilePicture(user.profilePicture || undefined);
      setError('');
    }
  }, [visible, user]);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5,
        maxWidth: 300,
        maxHeight: 300,
        includeBase64: true,
      });
      if (result.assets && result.assets[0]?.base64) {
        const base64Uri = `data:${result.assets[0].type || 'image/jpeg'};base64,${result.assets[0].base64}`;
        setProfilePicture(base64Uri);
      }
    } catch (e) {
      console.error('Image picker error:', e);
    }
  };

  const validateEnrollmentId = (id: string) => {
    if (!id) return 'Matrícula é obrigatória.';
    if (!/^\d{9}$/.test(id))
      return 'A matrícula deve conter exatamente 9 dígitos.';
    return '';
  };

  const handleSave = async () => {
    const dataToSave: any = {};
    let hasChanges = false;

    // Check displayName change
    if (displayName !== (user?.displayName || '')) {
      dataToSave.displayName = displayName || '';
      hasChanges = true;
    }

    // Check profilePicture change
    if (profilePicture !== (user?.profilePicture || undefined)) {
      dataToSave.profilePicture = profilePicture || '';
      hasChanges = true;
    }

    // Check enrollmentId change (only if not a teacher or teacher already has one)
    if (user?.role !== 'TEACHER' && enrollmentId !== (user?.enrollmentId || '')) {
      const validationError = validateEnrollmentId(enrollmentId);
      if (validationError) {
        setError(validationError);
        return;
      }
      dataToSave.enrollmentId = enrollmentId;
      hasChanges = true;
    }

    if (!hasChanges && isMandatory && !user?.enrollmentId) {
      // If mandatory and no ID yet, validation fails (should be covered above but check empty)
      if (!enrollmentId) {
        setError('Matrícula é obrigatória.');
        return;
      }
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updatedUser = await apiFetch<User>(`/users/${user?.id}`, {
        method: 'PATCH',
        body: JSON.stringify(dataToSave),
      });

      if (onSaveSuccess) {
        onSaveSuccess(updatedUser);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Erro ao salvar o perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        if (!isMandatory) onClose();
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>
              {isMandatory ? 'Complete seu Cadastro' : 'Editar Perfil'}
            </Text>
            {!isMandatory && (
              <TouchableOpacity onPress={onClose} disabled={loading}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          {isMandatory && (
            <Text style={styles.mandatoryText}>
              Para continuar, por favor informe sua matrícula.
            </Text>
          )}

          {/* Profile Picture */}
          <TouchableOpacity style={styles.avatarPickerContainer} onPress={handlePickImage} disabled={loading}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatarPreview} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="camera-alt" size={32} color={colors.placeholder} />
              </View>
            )}
            <Text style={styles.avatarPickerText}>Alterar foto</Text>
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.name}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome de exibição</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={user?.name?.split(' ')[0] || 'Seu apelido'}
              placeholderTextColor="#999"
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email}
              editable={false}
            />
          </View>

          {user?.role !== 'TEACHER' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Matrícula (9 dígitos)*</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                value={enrollmentId}
                onChangeText={text => {
                  // Allow only numbers
                  const numeric = text.replace(/[^0-9]/g, '');
                  setEnrollmentId(numeric);
                  if (error) setError('');
                }}
                placeholder="Ex: 123110530"
                keyboardType="numeric"
                maxLength={9}
                editable={!loading}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  mandatoryText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#777',
    borderColor: '#E0E0E0',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  avatarPickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarPickerText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});
