import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const colors = {
    background: '#FEF7FF',
    primary: '#4F378B',
    genericAvatar: '#EADDFF',
    text: '#1D1B20',
    subText: '#49454F',
};

interface ProfessorHomeHeaderProps {
    onAddClass?: () => void;
}

export default function ProfessorHomeHeader({ onAddClass }: ProfessorHomeHeaderProps) {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <View style={styles.headerContent}>

                {/* Left: Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>

                {/* Center: Greeting/Title */}
                <View style={styles.textContainer}>
                    <Text style={styles.greeting}>Olá, Professor</Text>
                </View>

                {/* Right: Actions */}
                <View style={styles.rightContainer}>
                    {onAddClass && (
                        <TouchableOpacity onPress={onAddClass} style={styles.actionButton}>
                            <MaterialIcons name="add" size={28} color={colors.primary} />
                        </TouchableOpacity>
                    )}

                    {/* Profile Icon */}
                    <TouchableOpacity style={styles.avatarContainer}>
                        <MaterialIcons
                            name="person"
                            size={24}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        marginBottom: 10,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerContent: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    textContainer: {
        flex: 1,
        alignItems: 'center', // Center properly
        marginRight: 40, // Offset right container width to center text if needed, 
        // though flex:1 usually handles it well enough if items match.
        // Actually, let's keep it simple. Flex 1 and center is standard.
    },
    greeting: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.genericAvatar,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
