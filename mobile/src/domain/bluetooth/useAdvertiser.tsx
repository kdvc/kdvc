import { useCallback, useState } from 'react';
import { startBroadcast, stopBroadcast } from '../../ble/BleBroadcaster';
import { INDENTIFIER } from './types';

export const useAdvertiser = () => {
  const [isAdvertising, setIsAdvertising] = useState<boolean>(false);

  const startAdvertising = useCallback(
    (uuid: string) => {
      const uuidBytes =
        uuid
          .replace(/-/g, '')
          .match(/.{1,2}/g)
          ?.map(byte => parseInt(byte, 16)) || [];

      const message = [INDENTIFIER, ...uuidBytes];

      try {
        startBroadcast(INDENTIFIER, message);
        setIsAdvertising(true);
      } catch (e) {
        console.warn('start error:', e);
        setIsAdvertising(false);
      }
    },
    [],
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
