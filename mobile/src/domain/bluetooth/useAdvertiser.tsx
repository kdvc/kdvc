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
      if (!allowed) return;

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
