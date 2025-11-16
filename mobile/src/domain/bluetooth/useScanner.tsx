import { NativeEventEmitter, NativeModules } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { BleDevice, INDENTIFIER } from './types';
import BleAdvertiser from 'react-native-ble-advertiser';

export type useScannerProps = {
  allowed: boolean;
};

export const useScanner = ({ allowed }: useScannerProps) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [devices, setDevices] = useState<BleDevice[]>([]);

  const eventEmitter = useMemo(
    () => new NativeEventEmitter(NativeModules.BLEAdvertiser),
    [],
  );

  const startScan = useCallback(() => {
    setDevices([]);

    if (!allowed) return;

    BleAdvertiser.setCompanyId(INDENTIFIER);
    BleAdvertiser.scan([INDENTIFIER], {})
      .then(success => {
        setIsScanning(true);
        console.log('scan successful', success);
      })
      .catch(error => {
        setIsScanning(false);
        console.log('scan error', error);
      });

    eventEmitter.addListener('onDeviceFound', (device: BleDevice) => {
      console.log('device found: ', device);

      setDevices(prev => [
        ...prev.filter(d => d.deviceAddress !== device.deviceAddress),
        device,
      ]);
    });
  }, [allowed, eventEmitter]);

  const stopScan = () => {
    BleAdvertiser.stopScan()
      .then(success => {
        setIsScanning(false);
        console.log('Stop Scan Successful', success);
      })
      .catch(error => {
        setIsScanning(true);
        console.log('Stop Scan Error', error);
      });
  };

  return { isScanning, devices, stopScan, startScan };
};
