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
import { NavBar } from '../imports/react/components/navbar';
function Content({deep, deviceLinkId}: {deep: DeepClient, deviceLinkId: number}) {

  useEffect(() => {
    self["Geolocation"] = Geolocation
  })

  return (
    <Stack alignItems={"center"}>
      <NavBar/>
      <Text>
        Not implemented yet
      </Text>
    </Stack>
  );
}

export default function DevicePage() {
  return <Page renderChildren={({deep,deviceLinkId}) => <Content deep={deep} deviceLinkId={deviceLinkId} />} />
}