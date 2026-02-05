import { View, Text } from "react-native";
import { styles } from "./styles";

type AvatarProps = {
  label: string; 
};

export function Avatar({ label }: AvatarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
