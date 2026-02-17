import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfessorHomeScreen from './src/screens/professor/ProfessorHomeScreen';
import StudentHomeScreen from './src/screens/student/StudentHomeScreen';
import BluetoothScreen from './src/screens/BluetoothScreen';
import ClassDetailsScreen from './src/screens/professor/ClassDetailsScreen';
import StudentClassDetailsScreen from './src/screens/student/ClassDetailsScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
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
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="StudentHome"
                component={StudentHomeScreen}
                options={{ headerShown: false }}
              />
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
              <Stack.Screen
                name="StudentClassDetails"
                component={StudentClassDetailsScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
