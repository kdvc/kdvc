import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  date: string;
  present: boolean;
}

export default function PresenceCard({ date, present }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.date}>Dia {date}</Text>
      <Text style={[styles.status, present ? styles.present : styles.absent]}>
        {present ? 'Presente' : 'Ausente'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF7FF',
    borderWidth: 1,
    borderColor: '#CAC4D0',
  },
  date: {
    fontSize: 16,
    color: '#1D1B20',
    marginBottom: 6,
    fontWeight: 500
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  present: {
    color: '#34C759',
  },
  absent: {
    color: '#852221',
  },
});
