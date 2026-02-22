import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { stringify as uuidStringify } from 'uuid';

import CreateForm from '../../CreateForm';
import { useScanner } from '../domain/bluetooth/useScanner';
import { useStartAttendance } from '../domain/bluetooth/useStartAttendance';

const eventNames: Record<string, string> = {
  // Add known UUIDs here if any
  'f2642cf0-3b14-471d-891f-cfb52863ccd7': 'KDVC Event',
};

export default function BluetoothScreen() {
  const navigation = useNavigation<any>();
  const [formResponse, setResponse] = React.useState<any>(null);

  const { isAdvertising, startAttendance, stopAttendance, allowed } =
    useStartAttendance();
  const { devices, isScanning, startScan, stopScan } = useScanner({ allowed });

  const handleDevicePress = (device: any) => {
    console.log('Device pressed:', device);
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <SafeAreaView style={styles.container}>
          {/* Custom Header with Back Button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.header}>BLE Scanner & Advertiser</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isScanning && styles.activeButton]}
              disabled={!allowed}
              onPress={() => {
                if (isAdvertising) {
                  Alert.alert(
                    'Modo ativo',
                    'Pare o advertising antes de escanear.',
                  );
                  return;
                }
                isScanning ? stopScan() : startScan();
              }}
            >
              <Text style={styles.buttonText}>
                {isScanning ? 'Parar Scan' : 'Iniciar Scan'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isAdvertising && styles.activeButton]}
              disabled={!allowed}
              onPress={() => {
                if (isScanning) {
                  Alert.alert('Modo ativo', 'Pare o scan antes de anunciar.');
                  return;
                }
                isAdvertising
                  ? stopAttendance()
                  : startAttendance(formResponse);
              }}
            >
              <Text style={styles.buttonText}>
                {isAdvertising ? 'Parar Advertising' : 'Iniciar Advertising'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.statusText}>
            {isScanning
              ? '📡 Scanning ativo'
              : isAdvertising
              ? '📢 Advertising ativo'
              : 'Aguardando ação...'}
          </Text>

          {isScanning && (
            <>
              <Text style={styles.title}>Dispositivos encontrados:</Text>
              <FlatList
                data={devices}
                keyExtractor={item => item.address}
                renderItem={({ item }) => {
                  console.log(item);
                  if (
                    item.manufacturerData &&
                    item.manufacturerData.length == 17
                  ) {
                    let id = '';
                    try {
                      id = uuidStringify(
                        new Uint8Array(item.manufacturerData.slice(1)),
                      );
                    } catch (e) {
                      console.log('Error UUID', e);
                    }
                    const eventName = eventNames[id];
                    console.log('event names:', eventNames);

                    return (
                      <TouchableOpacity
                        style={styles.device}
                        onPress={() => handleDevicePress(item)}
                      >
                        <Text>{`${item.address} - ${
                          item.name || 'Sem nome'
                        }`}</Text>
                        <Text>{`UUID: ${id}`}</Text>
                        <Text>{`Event Name: ${
                          eventName || 'Carregando...'
                        }`}</Text>
                      </TouchableOpacity>
                    );
                  } else {
                    return null;
                  }
                }}
              />
            </>
          )}

          <CreateForm onSubmitResponse={setResponse} />

          {formResponse && (
            <View style={styles.formResponseBox}>
              <Text style={styles.formResponseTitle}>
                Resposta do servidor:
              </Text>
              <Text style={styles.formResponseText}>
                {JSON.stringify(formResponse, null, 2)}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  header: { fontSize: 22, fontWeight: 'bold' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  activeButton: { backgroundColor: '#28a745' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  statusText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  device: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  formResponseBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  formResponseTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  formResponseText: {
    fontFamily: 'monospace',
  },
});
