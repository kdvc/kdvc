import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { loadTokens } from './src/services/authStore';
import { usePermissions } from './src/shared/hooks/usePermissions';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import LoginScreen from './src/screens/LoginScreen';
import ProfessorHomeScreen from './src/screens/professor/ProfessorHomeScreen';
import StudentHomeScreen from './src/screens/student/StudentHomeScreen';
import BluetoothScreen from './src/screens/BluetoothScreen';
import ClassDetailsScreen from './src/screens/professor/ClassDetailsScreen';
import StudentClassDetailsScreen from './src/screens/student/ClassDetailsScreen';
import { StudentAttendanceProvider } from './src/context/StudentAttendanceContext';
import { BleManager } from 'react-native-ble-plx';
import { View, Text, StyleSheet } from 'react-native';

const bleManager = new BleManager();

function BluetoothBlocker({ children }: { children: React.ReactNode }) {
  const [bleState, setBleState] = React.useState<string>('Unknown');

  React.useEffect(() => {
    const subscription = bleManager.onStateChange((state) => {
      setBleState(state);
    }, true);
    return () => {
      subscription.remove();
    };
  }, []);

  if (bleState === 'PoweredOn' || bleState === 'Unknown') {
    return <>{children}</>;
  }

  return (
    <View style={styles.blockerContainer}>
      <Text style={styles.blockerTitle}>Bluetooth Desativado</Text>
      <Text style={styles.blockerText}>
        O uso do Bluetooth é estritamente obrigatório para alunos e professores acessarem este aplicativo. Por favor, ative o Bluetooth do seu dispositivo para continuar.
      </Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  usePermissions();

  useEffect(() => {
    loadTokens();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BluetoothBlocker>
        <SafeAreaProvider>
          <PaperProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen name="StudentHome" options={{ headerShown: false }}>
                  {() => (
                    <StudentAttendanceProvider>
                      <StudentHomeScreen />
                    </StudentAttendanceProvider>
                  )}
                </Stack.Screen>

                <Stack.Screen name="StudentClassDetails" options={{ headerShown: false }}>
                  {() => (
                    <StudentAttendanceProvider>
                      <StudentClassDetailsScreen />
                    </StudentAttendanceProvider>
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="ProfessorHome"
                  component={ProfessorHomeScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Bluetooth"
                  component={BluetoothScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="ClassDetails"
                  component={ClassDetailsScreen}
                  options={{ headerShown: false }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </BluetoothBlocker>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  blockerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF7FF',
    padding: 24,
  },
  blockerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B3261E',
    marginBottom: 16,
    textAlign: 'center',
  },
  blockerText: {
    fontSize: 16,
    color: '#49454F',
    textAlign: 'center',
    lineHeight: 24,
  },
});
