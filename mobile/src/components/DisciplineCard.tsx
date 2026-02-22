import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

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
  picture?: string;
  onStartCall: (lastClassId: string | null) => void;
  onPress?: () => void;
  isActive?: boolean;
  hasActiveCall?: boolean;
  lastClassId?: string | null;
}

export function DisciplineCard({
  name,
  schedule,
  studentCount,
  picture,
  onStartCall,
  onPress,
  isActive = true,
  hasActiveCall = false,
  lastClassId = null,
}: DisciplineCardProps) {
  const avatarLabel = name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const truncate = (str: string | undefined, max: number) => {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
  };

  const displayName = truncate(name, 30);
  const displaySchedule = truncate(schedule, 25);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.topSection}>
        <View style={styles.avatar}>
          {picture ? (
            <Image source={{ uri: picture }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{avatarLabel}</Text>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{displayName}</Text>
          {schedule && <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">{displaySchedule}</Text>}
          {studentCount !== undefined && (
            <Text style={styles.caption}>{studentCount} alunos</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.callButton,
          !isActive && styles.callButtonDisabled,
          hasActiveCall && styles.reopenButton,
        ]}
        onPress={() => onStartCall(lastClassId)}
        disabled={!isActive}
      >
        <Text
          style={[
            styles.callButtonText,
            !isActive && styles.callButtonTextDisabled,
            hasActiveCall && styles.reopenButtonText,
          ]}
        >
          {isActive
            ? 'Gerenciar Chamada'
            : 'Fora de Horário'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'column',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',

    // Soft, modern shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // ... verify other styles exist or use view_file first?
  // I have the file content in history.
  reopenButton: {
    backgroundColor: '#4F378B', // Purple to match theme
  },
  reopenButtonText: {
    color: '#FFF',
  },

  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },

  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1B20',
    letterSpacing: 0.1,
    marginBottom: 2,
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
