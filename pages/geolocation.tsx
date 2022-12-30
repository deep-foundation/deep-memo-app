
import React, { useCallback, useState } from 'react';
import { TokenProvider } from '@deep-foundation/deeplinks/imports/react-token';
import { LocalStoreProvider, useLocalStore } from '@deep-foundation/store/local';
import { DeepProvider, useDeep, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';

import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import { initializePackage as initializePackageGeolocation } from '../imports/geolocation/initialize-package';
import { initializePackage as initializePackagePosition } from '../imports/position/initialize-package';
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
    timeout: 10000,
    maximumAge: 0,
  });
  const [loc, setLoc] = useState<any>(null);
  const [locHistory, setLocHistory] = useState<any>([]);
  const [status, setStatus] = useState<any>(null);
  const [permissionStatus, setPermissionStatus] = useState<any>(null);
  const [watchId, setWatchId] = useState<any>(null);

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

  const watchPosition = async () => {
    try {
      if (await checkPermissions() === 'denied') {
        setLoc(null);
        await Geolocation.requestPermissions();
      }
      const watchId = Geolocation.watchPosition(options, (position, err) => {
        if (err) {
          console.log(err);
          setStatus(err.message);
          return;
        }
        setLoc(position);
        savePosition(deep, deviceLinkId, {x: position.coords.longitude, y: position.coords.latitude, z: position.coords.altitude});
        setLocHistory(oldLocHistory => [...oldLocHistory, position]);
      });
      setWatchId(watchId);
      return watchId;
    } catch (error) {
      console.log(error);
    }
  };

  const clearWatch = async () => {
    try {
      await Geolocation.clearWatch({id: watchId});
    } catch (error) {
      console.log(error);
    }
  };

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
    await initializePackageDevice(deep);
    await initializePackageGeolocation(deep);
    await initializePackagePosition(deep);
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
    <p>Permission status: {permissionStatus || '-'}</p>
    <p>Status: {status || '-'}</p>
    <p>Latitude: {loc?.coords?.latitude || '-'}</p>
    <p>Longitude: {loc?.coords?.longitude || '-'}</p>
    <p>History: {locHistory.map((loc: any) => `[${loc.coords.latitude}, ${loc.coords.longitude}]`).join(', ')}</p>
    <p>Options: {JSON.stringify(options)}</p>
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