import { useCallback, useState } from 'react';
import BleAdvertiser from 'react-native-ble-advertiser';
import { INDENTIFIER, KDVC_SERVICE_ID } from './types';

export type useAdvertiserProps = {
  allowed: boolean;
};

export const useAdvertiser = ({ allowed }: useAdvertiserProps) => {
  const [isAdvertising, setIsAdvertising] = useState<boolean>(false);

  const startAdvertising = useCallback(() => {
    if (!allowed) return;

    BleAdvertiser.setCompanyId(INDENTIFIER);
    BleAdvertiser.broadcast(KDVC_SERVICE_ID, [INDENTIFIER], {
      connectable: true,
      includeTxPowerLevel: true,
    })
      .then(s => {
        console.log('advertising iniciado', s);
        setIsAdvertising(true);
      })
      .catch(err => {
        console.log('erro ao inciar advertising: ', err);
        setIsAdvertising(false);
      });
  }, [allowed]);

  const stopAdvertising = async () => {
    BleAdvertiser.stopBroadcast()
      .then(success => {
        console.log('Advertising finalizado', success);
        setIsAdvertising(false);
      })
      .catch(error => console.log('Erro ao finalizar advertising', error));
  };

  return { isAdvertising, startAdvertising, stopAdvertising };
};
