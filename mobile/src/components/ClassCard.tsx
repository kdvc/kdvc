import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
  picture?: string;
  isAttendanceActive?: boolean;
  activeTopic?: string;
  isRegistered?: boolean;
  onPress?: () => void;
  onRegisterPresence?: () => void;
};

export function ClassCard({
  title,
  description,
  picture,
  isAttendanceActive = false,
  activeTopic,
  isRegistered = false,
  onPress,
  onRegisterPresence,
}: ClassCardProps) {

  const avatarLabel = title
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const truncate = (str: string | undefined, max: number) => {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
  };

  const displayTitle = truncate(title, 30);
  const displayDesc = truncate(description, 35);
  const displayTopic = activeTopic ? truncate(activeTopic, 15) : undefined;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.left}>
        <View style={styles.avatar}>
          {picture ? (
            <Image source={{ uri: picture }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{avatarLabel}</Text>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{displayTitle}</Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">{displayDesc}</Text>
        </View>
      </View>

      {/* Right side */}
      {isAttendanceActive ? (
        <View style={styles.rightContainer}>
          <View style={styles.activeBadge}>
            <Text style={styles.activeLabel} numberOfLines={1} ellipsizeMode="tail">
              {displayTopic ? `Chamada: ${displayTopic}` : 'Chamada Ativa'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              isRegistered && styles.registeredButton
            ]}
            onPress={isRegistered ? undefined : onRegisterPresence}
            disabled={isRegistered}
          >
            <Text style={[
              styles.registerButtonText,
              isRegistered && styles.registeredButtonText
            ]}>
              {isRegistered ? 'Registrada' : 'Registrar'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.rightContainerFallback}>
          <MaterialIcons name="chevron-right" size={24} color="#79747E" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
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

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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

  rightContainer: {
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
    flexShrink: 1, // ensure the right side can shrink if text is huge
  },

  rightContainerFallback: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 12,
  },

  activeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    flexShrink: 1, // Let badge shrink if text is long
  },

  activeLabel: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 8, // Slightly rounded, not full pill
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 1,
  },

  registeredButton: {
    backgroundColor: '#F5F5F5',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  registerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  registeredButtonText: {
    color: '#9E9E9E',
  },
});
