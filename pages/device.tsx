import React, { useEffect } from 'react';
import {
  useLocalStore,
} from '@deep-foundation/store/local';
import {
  DeepClient,
  DeepProvider,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import { Provider } from '../imports/provider';
import { Device } from '@capacitor/device';
import { getDeviceValueUpdateSerialOperations } from '@deep-foundation/capacitor-device';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import debug from 'debug'

function Content({deep, deviceLinkId}: {deep: DeepClient, deviceLinkId: number}) {

  useEffect(() => {
    self["Device"] = Device
    debug.enable('@deep-foundation/capacitor-device:*');
  })

  return (
    <Stack alignItems={"center"}>
      <NavBar/>
      <Button
        onClick={async () => {
          const deviceGeneralInfo = await Device.getInfo();
          const serialOperations = await getDeviceValueUpdateSerialOperations({deep, deviceLinkId, info: deviceGeneralInfo});
          await deep.serial({
            operations: serialOperations
          })
        }}
      >
        Save general info
      </Button>
      <Button
        onClick={async () => {
          const deviceBatteryInfo = await Device.getBatteryInfo();
          const serialOperations = await getDeviceValueUpdateSerialOperations({deep, deviceLinkId, info: deviceBatteryInfo});
          await deep.serial({
            operations: serialOperations
          })
        }}
      >
        Save battery info
      </Button>
      <Button
        onClick={async () => {
          const deviceLanguageCode = await Device.getLanguageCode();
          const serialOperations = await getDeviceValueUpdateSerialOperations({deep, deviceLinkId, info: {languageCode: deviceLanguageCode.value}});
          await deep.serial({
            operations: serialOperations
          })
        }}
      >
        Save language id
      </Button>
      <Button
        onClick={async () => {
          const deviceLanguageTag = await Device.getLanguageTag();
          const serialOperations = await getDeviceValueUpdateSerialOperations({deep, deviceLinkId, info: {languageTag: deviceLanguageTag.value}});
          await deep.serial({
            operations: serialOperations
          })
        }}
      >
        Save language tag
      </Button>
    </Stack>
  );
}

export default function DevicePage() {
  return <Page renderChildren={({deep,deviceLinkId}) => <Content deep={deep} deviceLinkId={deviceLinkId} />} />
}