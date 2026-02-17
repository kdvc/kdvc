import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [isLogin, setIsLogin] = useState(true);

    useEffect(() => {
        try {
            GoogleSignin.configure({
                // webClientId: '<FROM_GOOGLE_CLOUD_CONSOLE>', // Optional: Add if using ID tokens
            });
            checkExistingLogin();
        } catch (error) {
            console.error('Google Sign-In configuration error:', error);
        }
    }, []);

    const checkExistingLogin = async () => {
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
    };

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            await GoogleSignin.signIn();

            if (isLogin) {
                // Login Flow: Check for existing role
                const savedRole = await AsyncStorage.getItem('userRole');
                if (savedRole === 'professor') {
                    navigation.replace('ProfessorHome');
                } else if (savedRole === 'student') {
                    navigation.replace('StudentHome');
                } else {
                    Alert.alert(
                        'Perfil não encontrado',
                        'Não encontramos um perfil vinculado neste dispositivo. Se é seu primeiro acesso, escolha "Crie sua conta".'
                    );
                }
            } else {
                // Register Flow: Go to Role Selection
                navigation.replace('Home');
            }

        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // cancelled
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // in progress
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Erro', 'Google Play Services não está disponível.');
            } else {
                // Fallback / Dev mode checks
                if (isLogin) {
                    const savedRole = await AsyncStorage.getItem('userRole');
                    if (savedRole === 'professor') {
                        navigation.replace('ProfessorHome');
                    } else if (savedRole === 'student') {
                        navigation.replace('StudentHome');
                    } else {
                        Alert.alert('Dev: Perfil não encontrado', 'Cadastre-se primeiro.');
                    }
                } else {
                    navigation.replace('Home');
                }
            }
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
                        <Text style={styles.signInLabel}>
                            {isLogin ? 'Acesse sua conta' : 'Crie sua conta'}
                        </Text>
                        <GoogleSigninButton
                            size={GoogleSigninButton.Size.Wide}
                            color={GoogleSigninButton.Color.Dark}
                            onPress={signIn}
                            disabled={false}
                            style={styles.googleButton}
                        />

                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setIsLogin(!isLogin)}
                        >
                            <Text style={styles.toggleText}>
                                {isLogin
                                    ? 'Não tem uma conta? Cadastre-se'
                                    : 'Já tem uma conta? Entre'}
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
