import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';

interface Student {
    id: string;
    name: string;
    present: boolean;
}

interface AttendanceModalProps {
    visible: boolean;
    disciplineName: string;
    students: Student[];
    onClose: () => void;
    onTogglePresence: (studentId: string) => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
    visible,
    disciplineName,
    students,
    onClose,
    onTogglePresence,
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Chamada - {disciplineName}</Text>
                    <Text style={styles.subtitle}>Toque no aluno para confirmar presença</Text>

                    <FlatList
                        data={students}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => onTogglePresence(item.id)}
                                style={[
                                    styles.studentItem,
                                    { opacity: item.present ? 1 : 0.3 }, // Transparent if absent, opaque if present
                                ]}
                            >
                                <Text style={styles.studentName}>{item.name}</Text>
                                {item.present && <Text style={styles.presentStatus}>Presente</Text>}
                            </TouchableOpacity>
                        )}
                        style={styles.list}
                    />

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
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
        marginTop: 22,
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
        fontSize: 18,
        color: '#333',
    },
    presentStatus: {
        color: 'green',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#2196F3',
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
