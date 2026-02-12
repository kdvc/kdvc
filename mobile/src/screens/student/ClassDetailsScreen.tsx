import React, { useEffect, useState } from 'react';
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
import PrimaryButton from '../../components/PrimaryButton';
import { getClassById } from '../../services/mockApi';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ClassDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { classId } = route.params;

  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClass() {
      const data = await getClassById(classId);
      setClassData(data);
      setLoading(false);
    }

    loadClass();
  }, [classId]);

  if (loading || !classData) {
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
          {classData.attendanceHistory.map((item: any) => (
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
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color='#1D1B20' />
      </TouchableOpacity>


      <Text style={headerStyles.title}>{title}</Text>

      <View style={{ width: 24 }} />
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1B20',
    marginTop: 24,
    marginBottom: 16,
  },
  history: {
    gap: 0, // Gap handled by card margin
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
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#FEF7FF',
    gap: '16',
    marginBottom: 2,
    marginTop: 2
  },
  back: {
    fontSize: 34,
    color: '#4F378B',
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: '#1D1B20',

  },
});
