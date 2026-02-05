import { Pressable, Text } from "react-native";
import { styles } from "./styles";

type ButtonProps = {
  title: string;
  onPress?: () => void;
};

export function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.85 },
      ]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}
