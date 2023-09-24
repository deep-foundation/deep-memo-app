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
import { Page } from '../imports/react/components/page';
import { CapacitorStoreKeys } from '../imports/capacitor-store-keys';
import debug from 'debug'
import { NavBar } from '../imports/react/components/navbar';
import { updateDevice } from '@deep-foundation/capacitor-device';
import { DecoratedDeep } from '../imports/react/components/with-decorated-deep';

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