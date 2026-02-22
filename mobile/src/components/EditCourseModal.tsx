import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { apiFetch } from '../services/api';

interface Course {
    id: string;
    name: string;
    description?: string;
    picture?: string;
}

interface EditCourseModalProps {
    visible: boolean;
    onClose: () => void;
    course?: Course;
    onSaveSuccess?: (updated: Course) => void;
}

const colors = {
    primary: '#4F378B',
    background: '#FEF7FF',
    white: '#FFFFFF',
    text: '#1D1B20',
    error: '#B3261E',
    disabled: '#E0E0E0',
    placeholder: '#79747E',
};

export const EditCourseModal = ({
    visible,
    onClose,
    course,
    onSaveSuccess,
}: EditCourseModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [picture, setPicture] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible && course) {
            setName(course.name || '');
            setDescription(course.description || '');
            setPicture(course.picture || undefined);
            setError('');
        }
    }, [visible, course]);

    const handlePickImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.5,
                maxWidth: 400,
                maxHeight: 400,
                includeBase64: true,
            });
            if (result.assets && result.assets[0]?.base64) {
                const base64Uri = `data:${result.assets[0].type || 'image/jpeg'};base64,${result.assets[0].base64}`;
                setPicture(base64Uri);
            }
        } catch (e) {
            console.error('Image picker error:', e);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError('O nome da turma é obrigatório.');
            return;
        }

        const dataToSave: any = {};
        let hasChanges = false;

        if (name !== (course?.name || '')) {
            dataToSave.name = name;
            hasChanges = true;
        }
        if (description !== (course?.description || '')) {
            dataToSave.description = description;
            hasChanges = true;
        }
        if (picture !== (course?.picture || undefined)) {
            dataToSave.picture = picture || '';
            hasChanges = true;
        }

        if (!hasChanges) {
            onClose();
            return;
        }

        setLoading(true);
        setError('');

        try {
            const updated = await apiFetch<Course>(`/courses/${course?.id}`, {
                method: 'PATCH',
                body: JSON.stringify(dataToSave),
            });
            if (onSaveSuccess) {
                onSaveSuccess(updated);
            }
            onClose();
        } catch (err: any) {
            console.error(err);
            setError('Erro ao salvar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Editar Turma</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <MaterialIcons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Course Picture */}
                    <TouchableOpacity style={styles.avatarPickerContainer} onPress={handlePickImage} disabled={loading}>
                        {picture ? (
                            <Image source={{ uri: picture }} style={styles.avatarPreview} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <MaterialIcons name="photo-camera" size={32} color={colors.placeholder} />
                            </View>
                        )}
                        <Text style={styles.avatarPickerText}>Alterar foto</Text>
                    </TouchableOpacity>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nome da Turma</Text>
                        <TextInput
                            style={[styles.input, error ? styles.inputError : null]}
                            value={name}
                            onChangeText={(t) => { setName(t); if (error) setError(''); }}
                            placeholder="Ex: Programação I"
                            editable={!loading}
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Descrição (opcional)</Text>
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Descrição da turma"
                            multiline
                            numberOfLines={3}
                            editable={!loading}
                        />
                    </View>

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
        shadowOffset: { width: 0, height: 2 },
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
    avatarPickerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarPreview: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginBottom: 8,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
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
    multilineInput: {
        textAlignVertical: 'top',
        minHeight: 80,
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
});
