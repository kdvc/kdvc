import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { STORAGE_KEYS, getCurrentUser } from '../services/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUpdateUser } from '../hooks/useUpdateUser';

export default function HomeScreen() {
  // Acting as RoleSelectionScreen
  const navigation = useNavigation<any>();
  const { mutateAsync: updateUser } = useUpdateUser();

  const handleRoleSelect = async (role: 'professor' | 'student') => {
    const backendRole = role === 'professor' ? 'TEACHER' : 'STUDENT';
    const user = await getCurrentUser();

    try {
      if (user?.id) {
        await updateUser({ id: user.id, data: { role: backendRole } });
      }
      await AsyncStorage.setItem(STORAGE_KEYS.ROLE, role);
      if (role === 'professor') {
        navigation.replace('ProfessorHome');
      } else {
        navigation.replace('StudentHome');
      }
    } catch (e) {
      console.error('Failed to update role', e);
      Alert.alert(
        'Erro',
        'Não foi possível atualizar o papel. Tente novamente.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF7FF" />

      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#1D1B20" />
          </TouchableOpacity>
        )}

        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Boas-vindas!</Text>
          <Text style={styles.subtitleText}>
            Para personalizarmos sua experiência,{'\n'}escolha seu perfil de
            acesso.
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => handleRoleSelect('professor')}
        >
          <View style={[styles.iconContainer, styles.iconProfessor]}>
            <MaterialIcons name="school" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Sou Professor</Text>
            <Text style={styles.cardDescription}>
              Gerencie turmas, realize chamadas e acompanhe a frequência dos
              alunos.
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#CAC4D0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => handleRoleSelect('student')}
        >
          <View style={[styles.iconContainer, styles.iconStudent]}>
            <MaterialIcons name="person" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Sou Aluno</Text>
            <Text style={styles.cardDescription}>
              Registre sua presença, visualize seus horários e histórico de
              frequência.
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#CAC4D0" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Você poderá alterar isso mais tarde nas configurações.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7FF',
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    gap: 8,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D1B20',
  },
  subtitleText: {
    fontSize: 16,
    color: '#49454F',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconProfessor: {
    backgroundColor: '#4F378B', // Primary Purple
  },
  iconStudent: {
    backgroundColor: '#625B71', // Secondary
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1B20',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#49454F',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#938F99',
    textAlign: 'center',
  },
});
