import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/StudentHomeHeader';
import { ClassCard } from '../../components/ClassCard';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useStudentClasses } from '../../hooks/useStudentClasses';

export default function StudentHomeScreen() {
  const navigation = useNavigation<any>();
  const { data: classes = [] } = useStudentClasses();
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <ClassCard
            title={item.name}
            description={item.description}
            isAttendanceActive={item.isAttendanceActive}
            isRegistered={registeredIds.has(item.id)}
            onPress={() =>
              navigation.navigate('StudentClassDetails', {
                classId: item.id,
              })
            }
            onRegisterPresence={() => {
              console.log(`Registrando presença na turma: ${item.name}`);
              setRegisteredIds(prev => new Set(prev).add(item.id));
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
