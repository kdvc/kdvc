import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  date: string;
  topic?: string;
  present: boolean;
  onPress?: () => void;
}

export default function PresenceCard({ date, topic, present, onPress }: Props) {
  const truncate = (str: string | undefined, max: number) => {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
  };

  const displayTopic = truncate(topic || 'Chamada', 25);

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.card} onPress={onPress}>
      <View style={styles.leftContainer}>
        <Text style={styles.date} numberOfLines={1} ellipsizeMode="tail">{displayTopic}</Text>
        <Text style={styles.topic}>{date}</Text>
      </View>
      <Text style={[styles.status, present ? styles.present : styles.absent]}>
        {present ? 'Presente' : 'Ausente'}
      </Text>
    </Container>
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
  leftContainer: {
    flex: 1,
    marginRight: 12,
  },
  date: {
    fontSize: 16,
    color: '#1D1B20',
    fontWeight: '500',
  },
  topic: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
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
