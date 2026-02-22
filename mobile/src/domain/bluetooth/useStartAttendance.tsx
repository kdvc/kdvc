import { NativeModules, Alert } from 'react-native';
import { usePermissions } from '../../shared/hooks/usePermissions';
import { useAdvertiser } from './useAdvertiser';

const { BleBroadcaster } = NativeModules as {
  BleBroadcaster: {
    isBluetoothEnabled(): Promise<boolean>;
    requestEnableBluetooth(): Promise<boolean>;
  };
};

export const useStartAttendance = () => {
  const { allowed, checkPermissions } = usePermissions();
  const { isAdvertising, startAdvertising, stopAdvertising } = useAdvertiser();

  const startAttendance = async (classId: string): Promise<boolean> => {
    if (!allowed) {
      console.log('[useStartAttendance] allowed is false, checking permissions manually...');
      const ok = await checkPermissions();
      if (!ok) return false;
    }
    try {
      const btEnabled = await BleBroadcaster.isBluetoothEnabled();
      if (!btEnabled) {
        await BleBroadcaster.requestEnableBluetooth();
        Alert.alert(
          'Bluetooth desligado',
          'Ligue o Bluetooth e tente novamente.',
        );
        return false;
      }
    } catch (e) {
      console.warn('Erro ao verificar Bluetooth:', e);
    }

    console.log('Starting attendance for class:', classId);

    // Call startAdvertising - the Ref inside useAdvertiser will now see the true value
    startAdvertising(classId);
    return true;
  };

  const stopAttendance = () => {
    stopAdvertising();
  };

  return { isAdvertising, startAttendance, stopAttendance, allowed };
};
