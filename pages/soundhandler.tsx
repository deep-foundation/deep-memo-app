import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStore } from '@deep-foundation/store/local';
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Provider } from '../imports/provider';
import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import initializePackage, { PACKAGE_NAME } from '../imports/sound-handler/initialize-package';
import insertSoundHandler from '../imports/sound-handler/sound-handler';

function Page() {
  const deep = useDeep();
  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );


return <Stack>
  <Button onClick={async () => await initializePackage(deep)}>
    INITIALIZE PACKAGE
  </Button>
  <Button onClick={async () => await insertSoundHandler(deep)}>
    INSERT HANDLER
  </Button>
</Stack>
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