
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
import { checkPermissions } from '../imports/geolocation/check-permissions';
import { requestPermissions } from '../imports/geolocation/request-permissions';
import { getCurrentPosition } from '../imports/geolocation/get-current-position';
import { watchPosition } from '../imports/geolocation/watch-position';
import { clearWatch } from '../imports/geolocation/clear-watch';


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
      await initializePackageDevice(deep);
      if(!deviceLinkId) {
        const deviceTypeLinkId = await deep.id(PACKAGE_NAME, "Device");
        const {data: [{id: newDeviceLinkId}]} = await deep.insert({
          type_id: deviceTypeLinkId
        })
        console.log({newDeviceLinkId});
        setDeviceLinkId(newDeviceLinkId);
      }
      console.log({deviceLinkId});
      
    }}>Initialize package device</Button>
    <Button onClick={async () => {initializePackagePosition(deep)}}>Initialize package position</Button>
    <Button onClick={async () => {initializePackageGeolocation(deep)}}>Initialize package geolocation</Button>

    <Button onClick={() => checkPermissions(setPermissionStatus)}>Check geolocation permission</Button>
    <Button onClick={() => requestPermissions(setPermissionStatus)}>Request geolocation permission</Button>
    <Button onClick={() => getCurrentPosition({deep, deviceLinkId, setPermissionStatus, setLoc})}>Get Current Location</Button>
    <Button onClick={() => watchPosition}>Watch Location</Button>
  <Button onClick={() => clearWatch({watchId, setWatchId})}>Clear Watch</Button>
    <Button onClick={() => getPositions({deep, deviceLinkId, setPosHistory})}>Get positions from deep</Button>
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
