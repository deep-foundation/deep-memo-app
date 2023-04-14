
import React, { useCallback, useState, useEffect } from 'react';
import { TokenProvider } from '@deep-foundation/deeplinks/imports/react-token';
import { LocalStoreProvider, useLocalStore } from '@deep-foundation/store/local';
import { DeepProvider, useDeep, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';

import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import { PACKAGE_NAME } from '../imports/device/package-name';
import { initializePackage as initializePackageGeolocation } from '../imports/geolocation/initialize-package';
import { initializePackage as initializePackagePosition } from '../imports/position/initialize-package';
import { getPositions } from '../imports/position/get-positions';
import { savePosition } from '../imports/position/save-position';
import { Provider } from '../imports/provider';
import { checkPermissions } from '../imports/position/check-permissions';
import { requestPermissions } from '../imports/position/request-permissions';
import { getCurrentPosition } from '../imports/position/get-current-position';
import { watchPosition } from '../imports/position/watch-position';
import { clearWatch } from '../imports/position/clear-watch';


function Page() {
  const deep = useDeep();
  const [deviceLinkId] = useLocalStore("deviceLinkId", undefined);
  const [options, setOptions] = useState<any>({
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
  });
  const [loc, setLoc] = useState<any>(null);
  const [locHistory, setLocHistory] = useState<any>([]);
  const [posHistory, setPosHistory] = useState<any>([]);
  const [status, setStatus] = useState<any>(null);
  const [permissionState, setPermissionState] = useState<any>(null);
  const [watchId, setWatchId] = useState<string>(null);

  return <Stack>
    <Button onClick={async () => {initializePackageGeolocation(deep)}}>Initialize package geolocation</Button>

    <Button onClick={async () => {initializePackagePosition(deep)}}>Initialize package position</Button>

    <Button onClick={() => checkPermissions({callback: ({newPermissionState}) => setPermissionState(newPermissionState)})}>Check geolocation permission</Button>

    <Button onClick={() => requestPermissions({}) &&
      checkPermissions({callback: ({newPermissionState}) => setPermissionState(newPermissionState)})
    }>Request geolocation permission</Button>

    <Button onClick={() => checkPermissions({callback: ({newPermissionState}) => setPermissionState(newPermissionState)}) &&
      getCurrentPosition({callback: ({coordinates}) => {
        console.log({coordinatesInGeolocationTSX: coordinates});
        setLoc(coordinates);
        savePosition(deep, deviceLinkId, {x: coordinates.coords.longitude, y: coordinates.coords.latitude, z: coordinates.coords.altitude});
      }})
    }>Get Current Location</Button>

    <Button onClick={() => checkPermissions({callback: ({newPermissionState}) => setPermissionState(newPermissionState)}) &&
      watchPosition({options, callback: ({error, newWatchId, newPosition}) => {
        console.log({error, newWatchId, newPosition});
        if (error) { setStatus(error.message); return; }
        if (newWatchId) { setWatchId(newWatchId); return; }
        if (newPosition) { 
          setLoc(newPosition);
          setLocHistory(oldLocHistory => [...oldLocHistory, newPosition]);
          savePosition(deep, deviceLinkId, {x: newPosition?.coords?.longitude, y: newPosition?.coords?.latitude, z: newPosition?.coords?.altitude});
        }
      }})}>Watch Location</Button>

    <Button onClick={() => clearWatch({watchId, callback: ({error}) => setWatchId(error || '-')})}>Clear Watch</Button>

    <Button onClick={() => getPositions({deep, deviceLinkId, callback: (positions) => setPosHistory(positions)})}>Get positions from deep</Button>

    <Text>DeviceLinkId: {deviceLinkId || '-'}</Text>
    <Text>Permission status: {permissionState || '-'}</Text>
    <Text>Status: {status || '-'}</Text>
    <Text>Latitude: {loc?.coords?.latitude || '-'}</Text>
    <Text>Longitude: {loc?.coords?.longitude || '-'}</Text>
    <Text>History: {locHistory.map((loc: any) => `[${loc?.coords?.latitude}, ${loc?.coords?.longitude}, ${loc?.timestamp}]`).join(', ')}</Text>
    <Text>Options: {JSON.stringify(options) || '-'}</Text>
    <Text>Positions length: {posHistory?.data?.length || '-'}</Text>
    <Text>Position from deep: {JSON.stringify(posHistory?.data) || '-'}</Text>
    <Text>Subscription id: {watchId || '-'}</Text>
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
