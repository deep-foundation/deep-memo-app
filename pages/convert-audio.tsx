import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStore } from '@deep-foundation/store/local';
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Provider } from '../imports/provider';
import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import installPackage from '../imports/convert-audio/install-package';
import insertConvertHandler from '../imports/convert-audio/insert-handler';

function Page() {

  const deep = useDeep();
  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );


  return (
    <Stack>
      <Button onClick={async () => await installPackage()}>
        INITIALIZE PACKAGE
      </Button>
      <Button onClick={async () => await insertConvertHandler(deep)}>
        INSERT HANDLER
      </Button>
    </Stack>
  )
}

export default function Index() {
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