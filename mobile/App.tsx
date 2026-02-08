import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import BluetoothScreen from './src/screens/BluetoothScreen';
import StudentHomeScreen from './src/screens/student/StudentHomeScreen';
import ProfessorHomeScreen from './src/screens/professor/ProfessorHomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StudentHome"
              component={StudentHomeScreen}
              options={{ title: 'Aluno' }}
            />
            <Stack.Screen
              name="ProfessorHome"
              component={ProfessorHomeScreen}
              options={{ title: 'Professor' }}
            />
            <Stack.Screen
              name="Bluetooth"
              component={BluetoothScreen}
              options={{ title: 'Scanner Bluetooth' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
