import { Geolocation, Position } from '@capacitor/geolocation';

export const getCurrentPosition = async ({callback}: {callback?: ({coordinates: Position}) => void}) => {
  try {
    const coordinates: Position = await Geolocation.getCurrentPosition();
    callback && callback({coordinates});
    return coordinates;
  } catch (error) {
    console.log(error);
    callback && callback({coordinates: null});
    return null;
  }
};