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
    onSetPresence: (studentId: string, present: boolean) => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
    visible,
    disciplineName,
    students,
    onClose,
    onSetPresence,
}) => {
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
                    <Text style={styles.modalTitle}>Chamada - {disciplineName}</Text>
                    <Text style={styles.subtitle}>Gerencie a presença dos alunos</Text>

                    <FlatList
                        data={students}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.studentItem}>
                                <Text style={[
                                    styles.studentName,
                                    item.present ? styles.textPresent : styles.textAbsent
                                ]}>
                                    {item.name}
                                </Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[
                                            styles.iconButton,
                                            item.present ? styles.presentButtonActive : styles.presentButtonInactive
                                        ]}
                                        onPress={() => onSetPresence(item.id, true)}
                                    >
                                        <Text style={[
                                            styles.buttonIcon,
                                            item.present ? styles.iconActive : styles.iconInactive
                                        ]}>✓</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.iconButton,
                                            !item.present ? styles.absentButtonActive : styles.absentButtonInactive
                                        ]}
                                        onPress={() => onSetPresence(item.id, false)}
                                    >
                                        <Text style={[
                                            styles.buttonIcon,
                                            !item.present ? styles.iconActive : styles.iconInactive
                                        ]}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
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
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
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
