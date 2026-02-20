// src/ble/BleBroadcaster.ts
import { NativeModules } from 'react-native';

const { BleBroadcaster } = NativeModules as {
  BleBroadcaster: {
    start(companyId: number, payload: number[]): Promise<void>;
    stop(): Promise<void>;
    isBluetoothEnabled(): Promise<boolean>;
    requestEnableBluetooth(): Promise<boolean>;
  };
};

export async function startBroadcast(companyId: number, bytes: number[]) {
  if (bytes.length > 31) throw new Error('Payload over 31 bytes');
  await BleBroadcaster.start(companyId, bytes);
}

export async function stopBroadcast() {
  await BleBroadcaster.stop();
}
