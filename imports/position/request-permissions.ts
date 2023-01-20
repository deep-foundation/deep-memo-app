import { Geolocation } from '@capacitor/geolocation';

export const requestPermissions = async ({callback}: {callback?: (requestPermissionsResult?, error?: any) => any}) => {
  try {
    const requestPermissionsResult: any = await Geolocation.requestPermissions();
    callback && callback({requestPermissionsResult});
    return requestPermissionsResult;
  } catch (error) {
    callback && callback({requestPermissionsResult: null, error});
  }
};