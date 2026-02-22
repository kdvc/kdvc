// src/domain/bluetooth/useScanner.ts
import { useCallback, useState } from 'react';
import { startScan, stopScan, ScannedDevice } from '../../ble/BleScanner';

export type useScannerProps = {
  allowed: boolean;
  onDeviceFound?: (device: ScannedDevice) => void;
};

export const useScanner = ({ allowed, onDeviceFound }: useScannerProps) => {
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const startScanWrapper = useCallback(() => {

    setDevices([]);
    setIsScanning(true);

    const unsubscribe = startScan(
      device => {
        if (onDeviceFound) {
          onDeviceFound(device);
        }
        setDevices(prev => {
          const exists = prev.find(d => d.address === device.address);
          if (exists) return prev;
          return [...prev, device];
        });
      },
      error => {
        console.error('Scan error:', error);
        setIsScanning(false);
      },
    );

    return unsubscribe;
  }, [allowed]);

  const stopScanWrapper = useCallback(async () => {
    await stopScan();
    setIsScanning(false);
  }, []);

  return {
    devices,
    isScanning,
    startScan: startScanWrapper,
    stopScan: stopScanWrapper,
  };
};
