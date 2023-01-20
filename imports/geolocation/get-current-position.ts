import { Geolocation } from '@capacitor/geolocation';
import { checkPermissions } from './check-permissions';
import { savePosition } from '../position/save-position';
import { Dispatch } from 'react';
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';

export const getCurrentPosition = async ({deep, deviceLinkId, setPermissionStatus, setLoc}: {deep: DeepClient, deviceLinkId: number, setPermissionStatus: Dispatch<any>, setLoc: Dispatch<any>}) => {
  try {
    if ((await checkPermissions(setPermissionStatus)) === 'denied') {
      setLoc(null);
      await Geolocation.requestPermissions();
    }
    const coordinates: any = await Geolocation.getCurrentPosition();
    setLoc(coordinates);
    savePosition(deep, deviceLinkId, {x: coordinates.coords.longitude, y: coordinates.coords.latitude, z: coordinates.coords.altitude});
  } catch (error) {
    console.log(error);
  }
};