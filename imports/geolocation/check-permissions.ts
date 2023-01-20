import { Geolocation } from '@capacitor/geolocation';
import { Dispatch } from 'react';

export const checkPermissions = async (setPermissionStatus: Dispatch<any>) => {
  try {
    const permissionStatus: any = await Geolocation.checkPermissions();
    console.log({permissionStatus});
    setPermissionStatus(permissionStatus?.location);
    return permissionStatus?.location;
  } catch {
    setPermissionStatus('error');
  }
};