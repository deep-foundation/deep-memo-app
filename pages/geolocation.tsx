import React, { useEffect } from 'react';
import {
  DeepClient,
} from '@deep-foundation/deeplinks/imports/client';
import { Stack, Text } from '@chakra-ui/react';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';
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