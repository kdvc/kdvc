import { View, Text } from "react-native";
import { styles } from "./styles";
import { ReactNode } from "react";

type ClassCardProps = {
  title: string;
  description: string;
  left?: ReactNode;
};

export function ClassCard({
  title,
  description,
  left,
}: ClassCardProps) {
  return (
    <View style={styles.container}>
      {left}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>
      </View>
    </View>
  );
}
