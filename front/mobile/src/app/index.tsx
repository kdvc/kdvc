import { View, StyleSheet } from "react-native";
import { ClassCard } from "../components/HorizontalCard";
import { Avatar } from "../components/Avatar";
import { colors } from "../theme/colors"

export default function Home() {
  return (
    <View style={styles.container}>
      <ClassCard
        title="Turma 1"
        description="Descrição"
        left={<Avatar label="T1" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});