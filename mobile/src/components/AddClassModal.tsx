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
} from 'react-native';
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface AddClassModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    schedules: { dayOfWeek: number; startTime: string; endTime: string }[];
    file: any | null;
  }) => void;
}

const colors = {
  background: '#FEF7FF',
  primary: '#4F378B',
  primaryLight: '#EADDFF',
  surface: '#FFFFFF',
  error: '#B3261E',
  text: '#1D1B20',
  outline: '#79747E',
  disabled: '#E0E0E0',
};

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] as const;
const SLOTS = ['8-10', '10-12', '14-16', '16-18'] as const;

type SlotKey = `${(typeof DAYS)[number]}_${(typeof SLOTS)[number]}`;

export const AddClassModal: React.FC<AddClassModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Set<SlotKey>>(new Set());
  const [file, setFile] = useState<any | null>(null);

  const toggleSlot = (key: SlotKey) => {
    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (next.size >= 2) {
          Alert.alert('Limite', 'Selecione no máximo 2 horários.');
          return prev;
        }
        next.add(key);
      }
      return next;
    });
  };

  const handleFilePick = async () => {
    try {
      const [result] = await pick({
        type: [types.allFiles],
        mode: 'import',
      });
      setFile(result);
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        // User cancelled
      } else {
        Alert.alert('Erro', 'Falha ao selecionar arquivo');
        console.error(err);
      }
    }
  };

  const parseSchedule = (): {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[] => {
    const dayMap: Record<string, number> = {
      Seg: 1,
      Ter: 2,
      Qua: 3,
      Qui: 4,
      Sex: 5,
    };

    const slotMap: Record<string, { start: string; end: string }> = {
      '8-10': { start: '08:00', end: '10:00' },
      '10-12': { start: '10:00', end: '12:00' },
      '14-16': { start: '14:00', end: '16:00' },
      '16-18': { start: '16:00', end: '18:00' },
    };

    return Array.from(selectedSlots).map(key => {
      const [dayStr, slotStr] = key.split('_');
      return {
        dayOfWeek: dayMap[dayStr],
        startTime: slotMap[slotStr].start,
        endTime: slotMap[slotStr].end,
      };
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, preencha o nome da turma.');
      return;
    }
    if (selectedSlots.size === 0) {
      Alert.alert(
        'Horário Obrigatório',
        'Por favor, selecione pelo menos um horário.',
      );
      return;
    }

    onSave({ name, schedules: parseSchedule(), file });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setSelectedSlots(new Set());
    setFile(null);
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
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Nova Turma</Text>

            {/* Nome */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome da Turma</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Cálculo I"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>

            {/* Schedule Grid */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Horários <Text style={styles.labelHint}>(selecione até 2)</Text>
              </Text>

              {/* Header row: day labels */}
              <View style={styles.gridRow}>
                <View style={styles.slotLabel} />
                {DAYS.map(day => (
                  <View key={day} style={styles.dayHeader}>
                    <Text style={styles.dayHeaderText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Slot rows */}
              {SLOTS.map(slot => (
                <View key={slot} style={styles.gridRow}>
                  <View style={styles.slotLabel}>
                    <Text style={styles.slotLabelText}>{slot}</Text>
                  </View>
                  {DAYS.map(day => {
                    const key: SlotKey = `${day}_${slot}`;
                    const isSelected = selectedSlots.has(key);
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.gridCell,
                          isSelected && styles.gridCellSelected,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => toggleSlot(key)}
                      >
                        {isSelected && (
                          <MaterialIcons
                            name="check"
                            size={18}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* File picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Lista de Alunos (Emails)</Text>
              <TouchableOpacity
                style={styles.fileButton}
                onPress={handleFilePick}
              >
                <MaterialIcons
                  name="attach-file"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.fileButtonText}>
                  {file ? file.name : 'Anexar Arquivo'}
                </Text>
              </TouchableOpacity>
              {file && (
                <TouchableOpacity
                  onPress={() => setFile(null)}
                  style={styles.removeFile}
                >
                  <Text style={styles.removeFileText}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Actions */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Criar Turma
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    padding: 20,
  },
  modalView: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  labelHint: {
    fontSize: 12,
    color: colors.outline,
    fontWeight: '400',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },

  /* ---- Schedule Grid ---- */
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  slotLabel: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.outline,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  gridCell: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 3,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  /* ---- File ---- */
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  fileButtonText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  removeFile: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  removeFileText: {
    color: colors.error,
    fontSize: 12,
  },

  /* ---- Buttons ---- */
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 100,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: colors.primary,
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
