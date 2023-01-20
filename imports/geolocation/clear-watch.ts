import { Geolocation } from '@capacitor/geolocation';
import { Dispatch } from 'react';

export const clearWatch = async ({watchId, setWatchId}: { watchId: string, setWatchId: Dispatch<any>}) => {
  try {
    await Geolocation.clearWatch({id: watchId});
    setWatchId(undefined);
  } catch (error) {
    console.log(error);
  }
};