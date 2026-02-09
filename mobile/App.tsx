import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

import HomeScreen from './src/screens/HomeScreen';
import ProfessorHomeScreen from './src/screens/professor/ProfessorHomeScreen';
import StudentHomeScreen from './src/screens/student/StudentHomeScreen';
import BluetoothScreen from './src/screens/BluetoothScreen';

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
              name="ProfessorHome"
              component={ProfessorHomeScreen}
              options={{ title: 'Professor Home' }}
            />
            <Stack.Screen
              name="StudentHome"
              component={StudentHomeScreen}
              options={{ title: 'Student Home' }}
            />
            <Stack.Screen
              name="Bluetooth"
              component={BluetoothScreen}
              options={{ title: 'Bluetooth Scanner' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
