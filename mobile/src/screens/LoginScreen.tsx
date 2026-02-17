import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLogin } from '../hooks/useLogin';

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const { mutateAsync: login } = useLogin();

  const checkExistingLogin = useCallback(async () => {
    try {
      // Check if user is already signed in with Google
      const isSignedIn = GoogleSignin.hasPreviousSignIn();

      if (isSignedIn) {
        // Check if role is saved
        const savedRole = await AsyncStorage.getItem('userRole');
        if (savedRole === 'professor') {
          navigation.replace('ProfessorHome');
        } else if (savedRole === 'student') {
          navigation.replace('StudentHome');
        } else {
          // Signed in but no role? Go to Role Selection
          // Optional: navigation.replace('Home');
          // But usually we wait for user interaction or auto-login logic here.
          // Let's just let the user click sign in, which will then route them.
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [navigation]);

  useEffect(() => {
    try {
      GoogleSignin.configure({
        offlineAccess: true,

        webClientId:
          '396493098070-9p9p64ms4c9qsdv8v8hsgdfqgbcmtotp.apps.googleusercontent.com',
      });
      checkExistingLogin();
    } catch (error) {
      console.error('Google Sign-In configuration error:', error);
    }
  }, [checkExistingLogin]);

  const signIn = async () => {
    try {
      console.log('Starting sign in...');

      await GoogleSignin.hasPlayServices();
      const { type, data } = await GoogleSignin.signIn();
      if (type !== 'success' || !data?.idToken) {
        throw new Error();
      }

      const { user, created } = await login(data.idToken);

      if (!created && user.role === 'TEACHER') {
        navigation.replace('ProfessorHome');
      } else if (!created && user.role === 'STUDENT') {
        navigation.replace('StudentHome');
      } else {
        // First time setup or role not selected
        navigation.replace('Home');
      }
    } catch (error: any) {
      console.log(error);

      let message = 'Erro desconhecido no login com Google';

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        message = 'Login cancelado pelo usuário';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        message = 'Login já está em andamento';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        message = 'Google Play Services não disponível';
      }

      Alert.alert('Erro no login', message, [{ text: 'OK' }], {
        cancelable: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF7FF" />

      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="fact-check" size={64} color="#4F378B" />
          </View>

          <Text style={styles.appTitle}>Keep Daily</Text>
          <Text style={styles.appTitleHighlight}>Virtual Check-in</Text>
          <Text style={styles.appAbbreviation}>KDVC</Text>

          <Text style={styles.tagline}>
            Gestão simplificada de presença para{'\n'}aulas presenciais.
          </Text>
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.cardInfo}>
            <Text style={styles.signInLabel}>Acesse sua conta</Text>
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={signIn}
              disabled={false}
              style={styles.googleButton}
            />

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.toggleText}>
                Não tem uma conta? Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>Versão 1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7FF', // Light lavender background
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#EADDFF', // Light purple circle
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 8,
    shadowColor: '#4F378B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '300', // Light font
    color: '#1D1B20',
    letterSpacing: -0.5,
  },
  appTitleHighlight: {
    fontSize: 32,
    fontWeight: '700', // Bold font
    color: '#4F378B', // Primary Purple
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  appAbbreviation: {
    fontSize: 14,
    fontWeight: '900',
    color: '#CAC4D0',
    letterSpacing: 4,
    marginBottom: 24,
  },
  tagline: {
    fontSize: 16,
    color: '#49454F',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  cardInfo: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  signInLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#49454F',
    marginBottom: 16,
  },
  googleButton: {
    width: '100%',
    height: 54,
  },
  versionText: {
    fontSize: 12,
    color: '#938F99',
  },

  toggleButton: {
    marginTop: 16,
    padding: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#4F378B',
    fontWeight: '500',
    textAlign: 'center',
  },
});
