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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,

    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  date: {
    fontSize: 16,
    color: '#1D1B20',
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  present: {
    color: '#1B5E20', // Darker green text
    backgroundColor: '#E8F5E9', // Light green bg
  },
  absent: {
    color: '#B71C1C', // Darker red text
    backgroundColor: '#FFEBEE', // Light red bg
  },
});
