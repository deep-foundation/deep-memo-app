import { Geolocation } from '@capacitor/geolocation';
import { savePosition } from '../position/save-position';
import { checkPermissions } from './check-permissions';
import { useCallback } from 'react';

export const watchPosition = useCallback(async (options, deep, deviceLinkId, setLoc, setStatus, setLocHistory, setWatchId, setPermissionStatus) => {
  try {
    if (await checkPermissions(setPermissionStatus) === 'denied') {
      setLoc(null);
      await Geolocation.requestPermissions();
    }
    const _watchId = await Geolocation.watchPosition(options, (position, err) => {
      if (err) {
        console.log(err);
        setStatus(err.message);
        return;
      }
      setLoc(position);
      savePosition(deep, deviceLinkId, {x: position.coords.longitude, y: position.coords.latitude, z: position.coords.altitude});
      setLocHistory(oldLocHistory => [...oldLocHistory, position]);
    });
    setWatchId(_watchId);
  } catch (error) {
    console.log(error);
  }
}, []);