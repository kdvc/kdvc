import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

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

  disabled: '#CFC7DD',
};

type ClassCardProps = {
  title: string;                 
  description: string;           
  isAttendanceActive?: boolean;    
  onPress?: () => void;
};

export function ClassCard({
  title,
  description,
  isAttendanceActive = false,
  onPress,
}: ClassCardProps) {

  const avatarLabel = title
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
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLabel}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{description}</Text>
        </View>
      </View>

      {/* Right side */}
      {isAttendanceActive && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Chamada ativa</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 12,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: colors.genericAvatar,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 4,
    fontWeight: '400',
  },

  badge: {
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    top: 16,
    
  },

  badgeText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '500',
  },
});
