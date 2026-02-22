import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';

interface StartClassModalProps {
    visible: boolean;
    hasActiveClass: boolean;
    hasAnyClass: boolean;
    onClose: () => void;
    onStartNew: (topic: string) => void;
    onReopen: () => void;
}

const colors = {
    background: '#FEF7FF',
    primary: '#4F378B',
    surface: '#FFFFFF',
    text: '#1D1B20',
    outline: '#79747E',
};

export const StartClassModal: React.FC<StartClassModalProps> = ({
    visible,
    hasActiveClass,
    hasAnyClass,
    onClose,
    onStartNew,
    onReopen,
}) => {
    const [topic, setTopic] = useState('');

    const handleStartNew = () => {
        if (!topic.trim()) {
            Alert.alert('Obrigatório', 'Por favor, insira o tópico/nome da aula.');
            return;
        }
        onStartNew(topic.trim());
        setTopic('');
    };

    const handleClose = () => {
        setTopic('');
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
                <View style={styles.modalView}>
                    <Text style={styles.title}>
                        {hasActiveClass ? 'Gerenciar Chamada' : 'Iniciar Chamada'}
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Tópico / Nome da Aula</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Aula Prática 01"
                            value={topic}
                            onChangeText={setTopic}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.startButton]}
                            onPress={() => onStartNew(topic)}
                        >            <Text style={[styles.buttonText, styles.startButtonText]}>Iniciar Nova</Text>
                        </TouchableOpacity>

                        {hasAnyClass && (
                            <TouchableOpacity
                                style={[styles.modalButton, styles.reopenButton]}
                                onPress={onReopen}
                            >                <Text style={[styles.buttonText, styles.reopenButtonText]}>Reabrir Última</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal >
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
        marginBottom: 24,
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 4,
    },
    reopenButton: {
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: 'transparent',
    },
    startButton: {
        backgroundColor: colors.primary,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    cancelButtonText: {
        color: colors.primary,
    },
    reopenButtonText: {
        color: colors.primary,
    },
    startButtonText: {
        color: colors.surface,
    },
});
