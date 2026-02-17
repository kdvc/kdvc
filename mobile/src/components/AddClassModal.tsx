import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface AddClassModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: { name: string; schedule: string; file: any | null }) => void;
}

const colors = {
    background: '#FEF7FF',
    primary: '#4F378B',
    surface: '#FFFFFF',
    error: '#B3261E',
    text: '#1D1B20',
    outline: '#79747E',
};

export const AddClassModal: React.FC<AddClassModalProps> = ({ visible, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [schedule, setSchedule] = useState('');
    const [file, setFile] = useState<any | null>(null);

    const handleFilePick = async () => {
        try {
            const [result] = await pick({
                type: [types.allFiles],
                mode: 'import',
            });
            setFile(result);
        } catch (err) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // User cancelled the picker, do nothing
            } else {
                Alert.alert('Erro', 'Falha ao selecionar arquivo');
                console.error(err);
            }
        }
    };

    const handleSave = () => {
        if (!name.trim() || !schedule.trim()) {
            Alert.alert('Campos Obrigatórios', 'Por favor, preencha o nome e o horário da turma.');
            return;
        }
        if (!file) {
            Alert.alert('Arquivo Obrigatório', 'Por favor, anexe a lista de alunos.');
            return;
        }

        onSave({ name, schedule, file });
        resetForm();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setName('');
        setSchedule('');
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
                    <Text style={styles.title}>Nova Turma</Text>

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

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Horário</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Seg/Qua 14:00"
                            value={schedule}
                            onChangeText={setSchedule}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Lista de Alunos (Emails)</Text>
                        <TouchableOpacity style={styles.fileButton} onPress={handleFilePick}>
                            <MaterialIcons name="attach-file" size={24} color={colors.primary} />
                            <Text style={styles.fileButtonText}>
                                {file ? file.name : 'Anexar Arquivo'}
                            </Text>
                        </TouchableOpacity>
                        {file && (
                            <TouchableOpacity onPress={() => setFile(null)} style={styles.removeFile}>
                                <Text style={styles.removeFileText}>Remover</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
                            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                            <Text style={[styles.buttonText, styles.saveButtonText]}>Criar Turma</Text>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: 'white',
        borderRadius: 28,
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
    input: {
        borderWidth: 1,
        borderColor: colors.outline,
        borderRadius: 4,
        padding: 12,
        fontSize: 16,
        color: colors.text,
    },
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
