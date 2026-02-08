import 'react-native-get-random-values';
import React from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    View,
} from 'react-native';
import { usePermissions } from '../shared/hooks/usePermissions';
import { useScanner } from '../domain/bluetooth/useScanner';
import { useAdvertiser } from '../domain/bluetooth/useAdvertiser';
import { BleDevice } from '../domain/bluetooth/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BluetoothScreen() {
    const { allowed } = usePermissions();

    const { devices, isScanning, startScan, stopScan } = useScanner({ allowed });
    const { isAdvertising, startAdvertising, stopAdvertising } = useAdvertiser({
        allowed,
    });

    const handleDevicePress = (d: BleDevice) => {
        return d;
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>BLE Scanner & Advertiser</Text>

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
                        isAdvertising ? stopAdvertising() : startAdvertising();
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
                        keyExtractor={item => item.deviceAddress}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.device}
                                onPress={() => handleDevicePress(item)}
                            >
                                <Text>{`${item.deviceAddress} - ${item.deviceName || 'Sem nome'
                                    }`}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
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
});
