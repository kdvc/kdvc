import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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
    marginBottom: 12
  },
  headerContent: {
    height: 64,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end', 
    paddingHorizontal: 18,
    marginTop: 10,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.genericAvatar,
    justifyContent: 'center',
    alignItems: 'center',
  },
});