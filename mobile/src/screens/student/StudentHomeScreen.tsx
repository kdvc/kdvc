import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudentHomeScreen() {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Área do Aluno</Text>
            <Text style={styles.subtitle}>Gerenciamento de presenças</Text>


            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Bluetooth')}
            >
                <Text style={styles.buttonText}>Acessar Scanner Bluetooth</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#E0F2F1', // Light Teal background
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00695C',
        marginTop: 20,
    },
    subtitle: {
        fontSize: 18,
        color: '#004D40',
        marginTop: 10,
        marginBottom: 40,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    actionButton: {
        backgroundColor: '#00796B',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
