import { Geolocation, Position } from '@capacitor/geolocation';

export const getCurrentPosition = async ({callback}: {callback?: ({coordinates}: {coordinates: Position}) => void}) => {
  try {
    const coordinates = await Geolocation.getCurrentPosition();
    callback?.({coordinates});
    return coordinates;
  } catch (error) {
    console.log(error);
    callback?.({coordinates: null});
    return null;
  }
};