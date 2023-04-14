
import { Geolocation } from '@capacitor/geolocation';
// import { Dispatch } from 'react';

export const clearWatch = async ({watchId, callback}: { watchId: string, callback?: ({ result, error }: { result?: string,  error?: any }) => void} ) => {
  try {
    await Geolocation.clearWatch({id: watchId});
    callback?.({result: 'success'});
  } catch (error) {
    console.error(error);
    callback?.({error})
  }
};
