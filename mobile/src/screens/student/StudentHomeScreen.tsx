import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/StudentHomeHeader';
import { ClassCard } from '../../components/ClassCard';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { getStudentClasses } from '../../services/mockApi';

export default function StudentHomeScreen() {
  const navigation = useNavigation<any>();

  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    getStudentClasses().then(setClasses);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <ClassCard
            title={item.name}
            description={item.description}
            isAttendanceActive={item.isAttendanceActive}
            isRegistered={item.isRegistered}
            onPress={() =>
              navigation.navigate('StudentClassDetails', {
                classId: item.id,
              })}
            onRegisterPresence={() => {
              console.log(`Registrando presença na turma: ${item.name}`);
              // Update local state to show as registered
              const updatedClasses = classes.map(c =>
                c.id === item.id ? { ...c, isRegistered: true } : c
              );
              setClasses(updatedClasses);
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7FF',
  },

  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
});
