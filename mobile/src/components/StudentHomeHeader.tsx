import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const colors = {
  background: '#FEF7FF',
  primary: '#4F378B',
  genericAvatar: '#EADDFF',
};

export default function Header() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>

        {/* Left: Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Center: Greeting */}
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>Olá, Estudante</Text>
        </View>

        {/* Right: Avatar */}
        <View style={styles.avatarContainer}>
          <MaterialIcons
            name="person"
            size={24}
            color={colors.primary}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    marginBottom: 10, // Reduced margin
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    height: 56, // Reduced height
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // Reduced padding
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1B20',
  },
  avatarContainer: {
    width: 40, // Reduced size
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.genericAvatar,
    justifyContent: 'center',
    alignItems: 'center',
  },
});