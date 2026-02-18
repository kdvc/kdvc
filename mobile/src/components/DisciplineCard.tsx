import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const colors = {
  primary: '#4F378B',
  background: '#FEF7FF',
  card: '#FFFFFF',
  border: '#CAC4D0',
  genericAvatar: '#EADDFF',

  textPrimary: '#1D1B20',
  textSecondary: '#FFFFFF',

  success: '#34C759',
  danger: '#852221',
};

interface DisciplineCardProps {
  name: string;
  schedule?: string;
  studentCount?: number;
  onStartCall: () => void;
  onPress?: () => void;
  isActive?: boolean;
}

export function DisciplineCard({
  name,
  schedule,
  studentCount,
  onStartCall,
  onPress,
  isActive = true, // Default to true if not provided (backward compatibility)
}: DisciplineCardProps) {
  const avatarLabel = name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.topSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLabel}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{name}</Text>
          {schedule && <Text style={styles.subtitle}>{schedule}</Text>}
          {studentCount !== undefined && (
            <Text style={styles.caption}>{studentCount} alunos</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.callButton, !isActive && styles.callButtonDisabled]}
        onPress={onStartCall}
        disabled={!isActive}
      >
        <Text
          style={[
            styles.callButtonText,
            !isActive && styles.callButtonTextDisabled,
          ]}
        >
          {isActive ? 'Iniciar Chamada' : 'Fora de Horário'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'column',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',

    // Soft, modern shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3E5F5', // Lighter purple
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },

  textContainer: {
    flex: 1,
    gap: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1B20',
    letterSpacing: 0.1,
  },

  subtitle: {
    fontSize: 14,
    color: '#757575',
  },

  caption: {
    fontSize: 12,
    color: '#9E9E9E',
  },

  callButton: {
    backgroundColor: colors.primary,
    borderRadius: 100, // Pill shape for button
    paddingVertical: 12, // Taller button
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 1,
  },

  callButtonDisabled: {
    backgroundColor: '#E0E0E0',
    elevation: 0,
  },

  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  callButtonTextDisabled: {
    color: '#9E9E9E',
  },
});
