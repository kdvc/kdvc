// src/ble/BleScanner.ts
import { NativeModules, NativeEventEmitter } from 'react-native';

const { BleScanner } = NativeModules as {
  BleScanner: {
    startScan(): Promise<void>;
    stopScan(): Promise<void>;
  };
};

const eventEmitter = new NativeEventEmitter(NativeModules.BleScanner);

export type ScannedDevice = {
  address: string;
  name: string;
  rssi: number;
  manufacturerData?: number[];
  manufacturerId?: number;
};

export function startScan(
  onDeviceFound: (device: ScannedDevice) => void,
  onError?: (error: any) => void,
) {
  const deviceListener = eventEmitter.addListener(
    'onDeviceFound',
    onDeviceFound,
  );
  const errorListener = eventEmitter.addListener(
    'onScanFailed',
    onError || (() => { }),
  );

  BleScanner.startScan().then(() => {
    // silently resolve
  }).catch(err => {
    console.error('Native startScan error:', err);
    onError?.(err);
  });

  return () => {
    deviceListener.remove();
    errorListener.remove();
    stopScan().catch(err => console.error('stopScan error in cleanup:', err));
  };
}

export async function stopScan() {
  await BleScanner.stopScan();
}
