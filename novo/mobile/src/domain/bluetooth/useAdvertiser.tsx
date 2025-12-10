import { useCallback, useState } from 'react';
import BleAdvertiser from 'react-native-ble-advertiser';
import { startBroadcast, stopBroadcast } from '../../ble/BleBroadcaster';
import { INDENTIFIER, KDVC_SERVICE_ID } from './types';

export type useAdvertiserProps = {
  allowed: boolean;
};

export const useAdvertiser = ({ allowed }: useAdvertiserProps) => {
  const [isAdvertising, setIsAdvertising] = useState<boolean>(false);

  const startAdvertising = useCallback((formResponse) => {
    if (!allowed) return;

    let message = [0x23];

    for(let key in formResponse) {
	message.push(formResponse[key]);
    }
    console.log("message: ", message);

	//    BleAdvertiser.setCompanyId(INDENTIFIER);
	//    BleAdvertiser.start(KDVC_SERVICE_ID, message, {
	// includeDeviceName: false,
	// includeTxPowerLevel: false,
	// connectable: false,
	//    })
	//      .then(s => {
	//        console.log('advertising iniciado', s);
	//        setIsAdvertising(true);
	//      })
	//      .catch(err => {
	//        console.log('erro ao inciar advertising: ', err);
	// console.log(message);
	//        setIsAdvertising(false);
	//      });
    try {
	startBroadcast(INDENTIFIER, message);
	setIsAdvertising(true);
    } catch (e) {
	console.warn('start error:', e);
	setIsAdvertising(false);
    }
  }, [allowed]);

  const stopAdvertising = async () => {
    // BleAdvertiser.stopBroadcast()
    //   .then(success => {
    //     console.log('Advertising finalizado', success);
    //     setIsAdvertising(false);
    //   })
    //   .catch(error => console.log('Erro ao finalizar advertising', error));
      try {
	  await stopBroadcast();
      } finally {
	  setIsAdvertising(false);
      }
  };

  return { isAdvertising, startAdvertising, stopAdvertising };
};
