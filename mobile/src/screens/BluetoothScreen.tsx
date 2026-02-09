import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    View,
} from 'react-native';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { useScanner } from '../../domain/bluetooth/useScanner';
import { useAdvertiser } from '../../domain/bluetooth/useAdvertiser';
import { ScannedDevice } from '../../ble/BleScanner';
import CreateForm from '../../CreateForm';
import { stringify as uuidStringify } from 'uuid';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

export default function BluetoothScreen() {
    const [formResponse, setResponse] = useState<any>(null);
    const [eventNames, setEventNames] = useState<Record<string, string>>({});
    const [errorName, setErrorName] = useState<string | null>(null);

    const { allowed } = usePermissions();

    const { devices, isScanning, startScan, stopScan } = useScanner({ allowed });
    const { isAdvertising, startAdvertising, stopAdvertising } = useAdvertiser({
        allowed,
    });

    const handleDevicePress = (d: ScannedDevice) => {
        return d;
    };

    const getEventName = async (id: string, address: string) => {
        console.log('getting event name of:', id);
        try {
            const res = await fetch(`http://192.168.1.107:8000/class/${id}/name`, {
                // Android emulator: 10.0.2.2, iOS simulator: localhost
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('verificando: ', res);

            if (!res.ok) {
                const text = await res.text();
                console.log('deu merda:', text);
                throw new Error(`Status ${res.status}: ${text}`);
            }

            console.log('pegando json');
            const json = await res.json();
            console.log('stringando json:', json);
            const name = json.name ?? JSON.stringify(json);

            console.log('got name: ', name);

            setEventNames(prev => ({
                ...prev,
                [id]: name,
            }));

            return name;
        } catch (e: any) {
            setErrorName(e.message ?? 'Unknown error');
        }
    };

    useEffect(() => {
        const fetchNames = async () => {
            for (const d of devices) {
                console.log('fetch name device:', d);
                if (
                    d.manufacturerData &&
                    d.manufacturerData.length === 17 &&
                    !eventNames[d.address]
                ) {
                    const id = uuidStringify(new Uint8Array(d.manufacturerData.slice(1)));
                    await getEventName(id, d.address);
                }
            }
        };

        fetchNames();
    }, [devices]);

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
                        isAdvertising
                            ? stopAdvertising()
                            : startAdvertising(formResponse);
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
                                const id = uuidStringify(new Uint8Array(item.manufacturerData.slice(1)));
                                const eventName = eventNames[id];
                                console.log('event names:', eventNames);

                                return (
                                    <TouchableOpacity
                                        style={styles.device}
                                        onPress={() => handleDevicePress(item)}
                                    >
                                        <Text>{`${item.address} - ${item.name || 'Sem nome'
                                            }`}</Text>
                                        <Text>{`UUID: ${id}`}</Text>
                                        <Text>{`Event Name: ${eventName || 'Carregando...'
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

            <View style={styles.formResponseBox}>
                <Text style={styles.formResponseTitle}>
                    Resposta do servidor:
                </Text>
                <Text style={styles.formResponseText}>
                    {typeof formResponse === 'string'
                        ? formResponse
                        : uuidStringify(new Uint8Array(Object.values(formResponse) as number[]))}
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        minWidth: 140,
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    statusText: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
        color: '#666',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 20,
    },
    device: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    formResponseBox: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#e8f4f8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#bce0fd',
    },
    formResponseTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#004466',
    },
    formResponseText: {
        fontFamily: 'monospace',
        color: '#333',
    },
});
