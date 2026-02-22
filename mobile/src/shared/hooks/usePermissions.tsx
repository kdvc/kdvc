import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
import { BleManager } from 'react-native-ble-plx';

const bleManager = new BleManager();

export const usePermissions = () => {
  const [allowed, setAllowed] = useState<boolean>(false);

  const ensurePermissions = async () => {
    const permissions =
      Platform.OS === 'android'
        ? [
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]
        : Platform.OS === 'ios'
          ? [PERMISSIONS.IOS.BLUETOOTH, PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]
          : [];

    const results = await requestMultiple(permissions as any);

    const deniedList = permissions.filter(p => results[p as any] !== RESULTS.GRANTED);
    const allGranted = deniedList.length === 0;

    if (!allGranted) {
      console.log('Permission denied for:', deniedList);
      Alert.alert(
        'Permissões Negadas',
        `Por favor, acesse as configurações do app e permita:\n\n${deniedList.map(p => p.split('.').pop()).join('\n')}`,
      );
    } else if (Platform.OS === 'android') {
      try {
        await bleManager.enable();
      } catch (err) {
        console.log('Bluetooth could not be automatically enabled or user denied prompt.', err);
      }
    }

    setAllowed(allGranted);
  };

  useEffect(() => {
    ensurePermissions();
  }, []);

  return { allowed };
};
