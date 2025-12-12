export type BleDevice = {
  deviceAddress: string;
  deviceName: string | null;
  txPower: number;
  advFlags: number;
  rssi: number;
  serviceUuids: string[];
};

export const INDENTIFIER = 0x2023;
export const KDVC_SERVICE_ID = 'f2642cf0-3b14-471d-891f-cfb52863ccd7';
