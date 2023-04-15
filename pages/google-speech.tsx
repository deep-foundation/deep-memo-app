import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStore } from '@deep-foundation/store/local';
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Provider } from '../imports/provider';
import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import initializePackage, { PACKAGE_NAME } from '../imports/google-speech/install-package';
import insertSoundHandler from '../imports/google-speech/insert-handler';
import insertGcloudAuthFile from '../imports/google-speech/insert-gcloud-auth-file';
import fs from "fs";
import installPackage from '../imports/google-speech/install-package';

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