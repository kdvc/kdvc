import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
import { BleManager } from 'react-native-ble-plx';

const bleManager = new BleManager();

// Shared state for all hook instances
let globalAllowed = false;
const listeners = new Set<(allowed: boolean) => void>();

const updateAllowed = (val: boolean) => {
  globalAllowed = val;
  listeners.forEach(l => l(val));
};

export const usePermissions = () => {
  const [allowed, setAllowed] = useState<boolean>(globalAllowed);

  useEffect(() => {
    // If global state changed before we mounted, sync now
    if (allowed !== globalAllowed) {
      setAllowed(globalAllowed);
    }

    const listener = (val: boolean) => {
      setAllowed(val);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [allowed]);

  const ensurePermissions = async () => {
    if (globalAllowed) return true;
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

    const deniedList = permissions.filter(p => {
      const status = results[p as any];
      return status !== RESULTS.GRANTED && status !== RESULTS.LIMITED;
    });

    const allGranted = deniedList.length === 0;

    updateAllowed(allGranted);

    if (!allGranted) {
      Alert.alert(
        'Permissões Necessárias',
        'O app precisa de permissões de Bluetooth e Localização para funcionar. Por favor, conceda-as nas configurações.',
        [{ text: 'OK' }]
      );
    } else if (Platform.OS === 'android') {
      bleManager.enable().catch(err => {
        console.warn('Bluetooth enable failed/skipped:', err);
      });
    }

    return allGranted;
  };

  useEffect(() => {
    ensurePermissions();

    const subscription = require('react-native').AppState.addEventListener('change', (nextAppState: string) => {
      if (nextAppState === 'active') {
        ensurePermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []); // Only on mount

  return { allowed, checkPermissions: ensurePermissions };
};
