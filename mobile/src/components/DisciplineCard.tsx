import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DisciplineCardProps {
    name: string;
    schedule?: string;
    studentCount?: number;
    onStartCall: () => void;
    onPress?: () => void;
}

export const DisciplineCard: React.FC<DisciplineCardProps> = ({ name, schedule, studentCount, onStartCall, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.infoContainer}>
                <Text style={styles.disciplineName}>{name}</Text>
                {schedule && <Text style={styles.scheduleText}>{schedule}</Text>}
                {studentCount !== undefined && (
                    <Text style={styles.studentCountText}>Total de Alunos: {studentCount}</Text>
                )}
            </View>

            <TouchableOpacity style={styles.callButton} onPress={onStartCall}>
                <Text style={styles.buttonText}>Iniciar chamada</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16, // Slightly more rounded
        padding: 20, // Increased padding
        marginBottom: 20, // Increased margin
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4, // More pronounced shadow
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 6,
        // Removed flexDirection: 'row' to stack items vertically
    },
    infoContainer: {
        marginBottom: 15, // Space between info and button
    },
    disciplineName: {
        fontSize: 22, // Larger font size
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    scheduleText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 4,
    },
    studentCountText: {
        fontSize: 14,
        color: '#777',
        marginTop: 4,
    },
    callButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center', // Center text
        width: '100%', // Full width button
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
