import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

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

    const results = await Promise.all(permissions.map(p => request(p)));
    const allGranted = results.every(r => r === RESULTS.GRANTED);

    if (!allGranted)
      Alert.alert(
        'Atenção',
        'Algumas permissões foram negadas. Vá para as configurações do aplicativo para permitir.',
      );

    setAllowed(allGranted);
  };

  useEffect(() => {
    ensurePermissions();
  }, []);

  return { allowed };
};
