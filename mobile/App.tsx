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

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  usePermissions();

  useEffect(() => {
    loadTokens();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
                {props => (
                  <StudentAttendanceProvider>
                    <StudentHomeScreen {...props} />
                  </StudentAttendanceProvider>
                )}
              </Stack.Screen>

              <Stack.Screen name="StudentClassDetails" options={{ headerShown: false }}>
                {props => (
                  <StudentAttendanceProvider>
                    <StudentClassDetailsScreen {...props} />
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
    </QueryClientProvider>
  );
}
