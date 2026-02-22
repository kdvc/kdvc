import { useCallback, useState } from 'react';
import { startBroadcast, stopBroadcast } from '../../ble/BleBroadcaster';
import { INDENTIFIER } from './types';

export type useAdvertiserProps = {
  allowed: boolean;
};

export const useAdvertiser = ({ allowed }: useAdvertiserProps) => {
  const [isAdvertising, setIsAdvertising] = useState<boolean>(false);

  const startAdvertising = useCallback(
    (uuid: string) => {

      const uuidBytes =
        uuid
          .replace(/-/g, '')
          .match(/.{1,2}/g)
          ?.map(byte => parseInt(byte, 16)) || [];

      const message = [INDENTIFIER, ...uuidBytes];

      console.log('[BLE Broadcaster] Starting broadcast...');
      console.log('[BLE Broadcaster] Original classId UUID:', uuid);
      console.log('[BLE Broadcaster] identifier:', INDENTIFIER);
      console.log('[BLE Broadcaster] parsed uuidBytes:', uuidBytes);
      console.log('[BLE Broadcaster] full payload message:', message);

      try {
        startBroadcast(INDENTIFIER, message);
        setIsAdvertising(true);
      } catch (e) {
        console.warn('start error:', e);
        setIsAdvertising(false);
      }
    },
    [allowed],
  );

  const stopAdvertising = async () => {
    try {
      await stopBroadcast();
      console.log('Broadcast stopped');
    } finally {
      setIsAdvertising(false);
    }
  };

  return { isAdvertising, startAdvertising, stopAdvertising };
};
