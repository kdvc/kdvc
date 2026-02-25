import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Clipboard,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface JoinCourseModalProps {
    visible: boolean;
    onClose: () => void;
    onJoin: (code: string) => void;
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

export const JoinCourseModal: React.FC<JoinCourseModalProps> = ({
    visible,
    onClose,
    onJoin,
    isLoading = false,
}) => {
    const [code, setCode] = useState('');

    const handleSubmit = () => {
        const trimmedCode = code.trim();
        if (!trimmedCode) {
            Alert.alert('Atenção', 'Por favor, digite o código de convite.');
            return;
        }
        onJoin(trimmedCode);
    };

    const handleClose = () => {
        setCode('');
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
                            <Text style={styles.title}>Entrar em Turma</Text>
                            <TouchableOpacity onPress={handleClose} disabled={isLoading}>
                                <MaterialIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.content}>
                            <Text style={styles.description}>
                                Peça ao seu professor o código da turma e digite-o aqui para participar.
                            </Text>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="EX: A1B2C3D"
                                    value={code}
                                    onChangeText={setCode}
                                    placeholderTextColor="#999"
                                    autoCapitalize="characters"
                                    maxLength={10}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSubmit}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.saveButton,
                                    (!code.trim() || isLoading) && styles.disabledButton,
                                ]}
                                onPress={handleSubmit}
                                disabled={!code.trim() || isLoading}
                            >
                                <Text style={[styles.buttonText, styles.saveButtonText]}>
                                    {isLoading ? 'Entrando...' : 'Entrar'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={handleClose}
                                disabled={isLoading}
                            >
                                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
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
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        alignSelf: 'center',
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
        // Removed flex: 1 to prevent layout collapse
    },
    description: {
        fontSize: 14,
        color: colors.outline,
        marginBottom: 20,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.outline,
        borderRadius: 8,
        backgroundColor: colors.inputBackground,
        height: 56, // Added fixed height
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        fontSize: 18,
        color: colors.text,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: 20,
        gap: 12,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    disabledButton: {
        backgroundColor: '#E0E0E0',
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
