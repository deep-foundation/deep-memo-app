import { Geolocation } from '@capacitor/geolocation';
import { checkPermissions } from './check-permissions';
import { Dispatch } from 'react';

export const requestPermissions = async (setPermissionStatus: Dispatch<any>) => {
  try {
    const requestPermissionsResult: any = await Geolocation.requestPermissions();
    console.log({requestPermissionsResult});
    checkPermissions(setPermissionStatus);
  } catch (error) {
    console.log(error);
  }
};