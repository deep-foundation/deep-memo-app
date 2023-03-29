import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStore } from '@deep-foundation/store/local';
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Provider } from '../imports/provider';
import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import installPackage, { PACKAGE_NAME } from '../imports/sound-handler/install-package';
import insertSoundHandler from '../imports/sound-handler/sound-handler';
import insertGcloudAuthFile from '../imports/sound-handler/insert-gcloud-auth-file';
import fs from "fs";

export async function getStaticProps() {
  const credentials = JSON.parse(fs.readFileSync("./imports/key.json", { encoding: "utf-8" }));
  console.log(credentials);
  return {
    props: {
      credentials
    }
  }
}

function Page({credentials}) {
  
  const deep = useDeep();
  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );


  return <Stack>
    <Text suppressHydrationWarning>Device link id: {deviceLinkId ?? " "}</Text>
    <Button onClick={async () => await installPackage()}>
      INITIALIZE PACKAGE
    </Button>
    <Button onClick={async () => await insertSoundHandler(deep)}>
      INSERT HANDLER
    </Button>
    <Button onClick={async () => await insertGcloudAuthFile(deep, credentials)}>
      INSERT GCLOUD AUTH FILE LINK
    </Button>
  </Stack>
}

export default function Index({credentials}) {
  return (
    <ChakraProvider>
      <Provider>
        <DeepProvider>
          <Page credentials={credentials} />
        </DeepProvider>
      </Provider>
    </ChakraProvider>
  );
}