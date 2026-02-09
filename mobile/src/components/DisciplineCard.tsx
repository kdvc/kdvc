import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DisciplineCardProps {
    name: string;
    schedule?: string;
    onStartCall: () => void;
    onPress?: () => void;
}

export const DisciplineCard: React.FC<DisciplineCardProps> = ({ name, schedule, onStartCall, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.infoContainer}>
                <Text style={styles.disciplineName}>{name}</Text>
                {schedule && <Text style={styles.scheduleText}>{schedule}</Text>}
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
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        marginRight: 10,
    },
    disciplineName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    scheduleText: {
        fontSize: 14,
        color: '#666',
    },
    callButton: {
        backgroundColor: '#4CAF50', // Green for action
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
