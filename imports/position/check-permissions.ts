import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { PermissionState } from '@capacitor/core';

export const checkPermissions = async ({callback}: {callback?: ({newPermissionState}: {newPermissionState: PermissionState}) => any}) => {
  try {
    const permissionStatus: PermissionStatus = await Geolocation.checkPermissions();
    console.log({permissionStatus});
    callback?.({newPermissionState: permissionStatus?.location});
    return permissionStatus?.location;
  } catch {
    callback?.({newPermissionState: null});
    return null;
  }
};