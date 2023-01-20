import { Geolocation } from '@capacitor/geolocation';

export const checkPermissions = async ({callback}: {callback?: ({newPermissionStatus}: {newPermissionStatus: any}) => any}) => {
  try {
    const permissionStatus: any = await Geolocation.checkPermissions();
    console.log({permissionStatus});
    // setPermissionStatus(permissionStatus?.location);
    callback && callback({newPermissionStatus: permissionStatus?.location});
    return permissionStatus?.location;
  } catch {
    // setPermissionStatus('error');
    callback && callback({newPermissionStatus: null});
    return null;
  }
};