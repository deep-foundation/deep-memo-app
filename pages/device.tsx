import React, { useEffect } from 'react';
import {
  useCapacitorStore,
} from '@deep-foundation/store/capacitor';
import {
  DeepClient,
  DeepProvider,
  useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import { Provider } from '../imports/provider';
import { Device } from '@capacitor/device';
import { updateDevice } from '@deep-foundation/capacitor-device';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import debug from 'debug'
import { DecoratedDeep } from '../imports/decorated-deep';

function Content({deep, deviceLinkId}: {deep: DecoratedDeep, deviceLinkId: number}) {

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
          await deep.updateDevice({deviceLinkId, info: deviceGeneralInfo})
        }}
      >
        Save general info
      </Button>
      <Button
        onClick={async () => {
          const deviceBatteryInfo = await Device.getBatteryInfo();
          await deep.updateDevice({deviceLinkId, info: deviceBatteryInfo})
        }}
      >
        Save battery info
      </Button>
      <Button
        onClick={async () => {
          const deviceLanguageCode = await Device.getLanguageCode();
          await deep.updateDevice({deviceLinkId, info: {
            languageCode: deviceLanguageCode.value
          }})
        }}
      >
        Save language id
      </Button>
      <Button
        onClick={async () => {
          const deviceLanguageTag = await Device.getLanguageTag();
          await deep.updateDevice({deviceLinkId, info: {
            languageTag: deviceLanguageTag.value
          }})
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