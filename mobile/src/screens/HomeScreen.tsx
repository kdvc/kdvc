import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const navigation = useNavigation<any>();

    const handleRoleSelect = (role: 'professor' | 'student') => {
        if (role === 'professor') {
            navigation.navigate('ProfessorHome');
        } else {
            navigation.navigate('StudentHome');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>Escolha seu perfil para continuar:</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, styles.professorButton]}
                    onPress={() => handleRoleSelect('professor')}
                >
                    <Text style={styles.buttonText}>Sou Professor</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.roleButton, styles.studentButton]}
                    onPress={() => handleRoleSelect('student')}
                >
                    <Text style={styles.buttonText}>Sou Aluno</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 20,
    },
    roleButton: {
        paddingVertical: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    professorButton: {
        backgroundColor: '#4A90E2', // Blue for professor
    },
    studentButton: {
        backgroundColor: '#50E3C2', // Teal/Green for student
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
