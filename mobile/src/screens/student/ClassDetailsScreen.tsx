import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';

import PresenceCard from '../../components/PresenceCard';
import { useCourseById } from '../../hooks/useClassById';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ClassDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { classId } = route.params;

  const { data: classData, isLoading } = useCourseById(classId);

  if (isLoading || !classData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F378B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ClassDetailsHeader title={classData.name} navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Histórico de Presença</Text>

        <View style={styles.history}>
          {classData.classes.map((item: any) => (
            <PresenceCard
              key={item.id}
              date={item.date}
              present={item.present}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================== HEADER ================== */

function ClassDetailsHeader({
  title,
  navigation,
}: {
  title: string;
  navigation: any;
}) {
  return (
    <View style={headerStyles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={headerStyles.backButton}
      >
        <Icon name="arrow-back" size={24} color="#4F378B" />
      </TouchableOpacity>

      <Text style={headerStyles.title}>{title}</Text>

      <View style={{ width: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7FF',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1B20',
    marginTop: 0,
    marginBottom: 16,
  },
  history: {
    gap: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF7FF',
  },
});

const headerStyles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FEF7FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 0,
    marginBottom: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1B20',
  },
});
