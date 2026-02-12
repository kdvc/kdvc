import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  disabled?: boolean;
  onPress: () => void;
}

export default function PrimaryButton({ title, disabled, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4F378B',
    paddingVertical: 22,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#9c9b9b',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
});
