import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const colors = {
  background: '#FEF7FF',
  primary: '#4F378B',
  genericAvatar: '#EADDFF',
};

export default function Header() {
  return (
    <View style={styles.container}>

      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Olá, Estudante</Text>
          <Text style={styles.subGreeting}>Bem-vindo de volta!</Text>
        </View>

        <TouchableOpacity style={styles.avatarContainer}>
          <MaterialCommunityIcons
            name="account-outline"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    marginBottom: 20, // Increased margin
    paddingTop: 10,
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space between text and avatar
    paddingHorizontal: 24, // Increased padding
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1B20',
  },
  subGreeting: {
    fontSize: 14,
    color: '#49454F',
    marginTop: 2,
  },
  avatarContainer: {
    width: 48, // Slightly larger
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.genericAvatar,
    justifyContent: 'center',
    alignItems: 'center',
  },
});