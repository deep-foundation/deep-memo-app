
import React, { useCallback, useState, useEffect } from 'react';
import { TokenProvider } from '@deep-foundation/deeplinks/imports/react-token';
import { LocalStoreProvider, useLocalStore } from '@deep-foundation/store/local';
import { DeepProvider, useDeep, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';

import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import { initializePackage as initializePackageGeolocation } from '../imports/geolocation/initialize-package';
import { initializePackage as initializePackagePosition } from '../imports/position/initialize-package';
import { getPositions } from '../imports/position/get-positions';
import { initializePackage as initializePackageDevice } from '../imports/device/initialize-package';
import { PACKAGE_NAME } from '../imports/device/package-name';
import { savePosition } from '../imports/position/save-position';
import { Provider } from '../imports/provider';
import { Geolocation } from '@capacitor/geolocation';

function Page() {

  const deep = useDeep();
  const [deviceLinkId, setDeviceLinkId] = useLocalStore("deviceLinkId", undefined);
  const [options, setOptions] = useState<any>({
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
  });
  const [loc, setLoc] = useState<any>(null);
  const [locHistory, setLocHistory] = useState<any>([]);
  const [posHistory, setPosHistory] = useState<any>([]);
  const [status, setStatus] = useState<any>(null);
  const [permissionStatus, setPermissionStatus] = useState<any>(null);
  const [watchId, setWatchId] = useState<string>(null);

  const getCurrentPosition = async () => {
    try {
      if (await checkPermissions() === 'denied') {
        setLoc(null);
        await Geolocation.requestPermissions();
      }
      const coordinates: any = await Geolocation.getCurrentPosition();
      setLoc(coordinates);
      savePosition(deep, deviceLinkId, {x: coordinates.coords.longitude, y: coordinates.coords.latitude, z: coordinates.coords.altitude});
      // Geolocation.checkPermissions(); // TODO: does not update permissionStatus state
    } catch (error) {
      console.log(error);
    }
  };

  const watchPosition = useCallback(async () => {
    try {
      if (await checkPermissions() === 'denied') {
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

  const clearWatch = async () => {
    try {
      console.log('clearWatch called');
      console.log({watchId});
      await Geolocation.clearWatch({id: watchId});
      setWatchId(undefined);
    } catch (error) {
      console.log('clearWatch error');
      console.log({watchId});
      console.log(error);
    }
  };

  const watchPositionAndUnwatch = useCallback(async () => {
    try {
      if (await checkPermissions() === 'denied') {
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
      try {
        console.log('clearWatch called');
        console.log({watchId, _watchId});
        await Geolocation.clearWatch({id: _watchId});
        setWatchId(undefined);
      } catch (error) {
        console.log('clearWatch error');
        console.log({watchId});
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const checkPermissions = async () => {
    const permissionStatus: any = await Geolocation.checkPermissions();
    console.log({permissionStatus});
    setPermissionStatus(permissionStatus?.location);
    return permissionStatus?.location;
  };

  const requestPermissions = async () => {
    try {
      const requestPermissionsResult: any = await Geolocation.requestPermissions();
      console.log({requestPermissionsResult});
    } catch (error) {
      console.log(error);
    }
  };

  const initializePackage = async (deep) => {
    console.log('initializePackage');
    console.log('initializePackageDevice');
    await initializePackageDevice(deep);
    console.log('initializePackageGeolocation');
    await initializePackageGeolocation(deep);
    console.log('initializePackagePosition');
    await initializePackagePosition(deep);
  };

  const getPositionsFromDeep = async () => {
    console.log('getPositionsFromDeep');
    const positions = await getPositions(deep, deviceLinkId);
    console.log({positions});
    setPosHistory(positions);
  };

  return <Stack>
    <Button onClick={async () => {
      await deep.guest();
      await deep.login({
        linkId: await deep.id("deep", "admin")
      });
    }}>Login as admin</Button>
        <Text>{deviceLinkId}</Text>
    <Button onClick={async () => {
      console.log({deviceLinkId});
      await initializePackage(deep);
      if(!deviceLinkId) {
        const deviceTypeLinkId = await deep.id(PACKAGE_NAME, "Device");
        const {data: [{id: newDeviceLinkId}]} = await deep.insert({
          type_id: deviceTypeLinkId
        })
        console.log({newDeviceLinkId});
        setDeviceLinkId(newDeviceLinkId);
      }
      console.log({deviceLinkId});
      
    }}>Initialize package</Button>

    <Button onClick={checkPermissions}>Check geolocation permission</Button>
    <Button onClick={requestPermissions}>Request geolocation permission</Button>
    <Button onClick={getCurrentPosition}>Get Current Location</Button>
    <Button onClick={watchPosition}>Watch Location</Button>
    <Button onClick={clearWatch}>Clear Watch</Button>
    <Button onClick={watchPositionAndUnwatch}>Watch Location and unwatch</Button>
    <Button onClick={getPositionsFromDeep}>Get positions from deep</Button>
    <p>Permission status: {permissionStatus || '-'}</p>
    <p>Status: {status || '-'}</p>
    <p>Latitude: {loc?.coords?.latitude || '-'}</p>
    <p>Longitude: {loc?.coords?.longitude || '-'}</p>
    <p>History: {locHistory.map((loc: any) => `[${loc.coords.latitude}, ${loc.coords.longitude}]`).join(', ')}</p>
    <p>Options: {JSON.stringify(options)}</p>
    <p>Positions length: {posHistory?.data?.length}</p>
    <p>Position from deep: {JSON.stringify(posHistory?.data)}</p>
    <p>Subscription id: {watchId || '-'}</p>
  </Stack>;
}

export default function GeolocationComponent() {
  return (
    <ChakraProvider>
      <Provider>
        <DeepProvider>
          <Page />
        </DeepProvider>
      </Provider>
    </ChakraProvider>
  );
}
