import { Geolocation } from '@capacitor/geolocation';
import { Position } from '@capacitor/geolocation';

export const watchPosition = async ({options, callback}: {options: object, callback?: ({newWatchId, error, newPosition}: {newWatchId?: string, error?: any, newPosition?: Position}) => any }) => {
  try {
    console.log('watchPosition', {options});
    const newWatchId = await Geolocation.watchPosition(options, (newPosition, error) => {
      if (error) {
        console.error(error);
        callback?.({error});
        return {error};
      }
      callback?.({newPosition});
    });
    callback?.({newWatchId});
    return {newWatchId};
  } catch (error) {
    console.error(error);
    callback?.({error});
    return {error};
  }
};