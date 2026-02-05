import { SafeAreaView, Text } from 'react-native';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Text>Frontend base pronto</Text>
    </SafeAreaView>
  );
}