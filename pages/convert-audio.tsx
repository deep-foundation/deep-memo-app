import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStore } from '@deep-foundation/store/local';
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Provider } from '../imports/provider';
import { Button, ChakraProvider, Stack, Text } from '@chakra-ui/react';
import installPackage from '../imports/convert-audio/install-package';

function Page() {
  const deep = useDeep();
  const [sounds, setSounds] = useLocalStore('Sounds', [])
  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

  const fetchSounds = async () => {
    const soundTypeLinkId = await deep.id("@deep-foundation/sound", "Sound");
    const formatTypeLinkId = await deep.id("@deep-foundation/sound", "Format");
    const mimetypeTypeLinkId = await deep.id("@deep-foundation/sound", "MIME/type");
    const { data: soundLinks } = await deep.select({
      type_id: soundTypeLinkId
    });

    let sounds = [];

    for (let soundLink of soundLinks) {
      const { data } = await deep.select({
        up: {
          parent: {
            id: soundLink.id
          },
          link: {
            type_id: {
              _in:
                [
                  soundTypeLinkId,
                  mimetypeTypeLinkId
                ]
            }
          }
        },
      })

      const id = data.filter((link) => link.type_id === soundTypeLinkId)[0].id
      const sound = data.filter((link) => link.type_id === soundTypeLinkId)[0].value.value
      const format = data.filter((link) => link.type_id === formatTypeLinkId)[0].value.value
      const mimetype = data.filter((link) => link.type_id === mimetypeTypeLinkId)[0].value.value
      sounds = [...sounds, { id, sound, mimetype }]
    }
    setSounds(sounds);
  }

  return <Stack>
    <Button onClick={async () => await installPackage()}>
      INSTALL PACKAGE
    </Button>
    <Button onClick={async () => await fetchSounds()}>
      LOAD ALL SOUNDS
    </Button>
    {sounds?.map((r) => <audio key={r.id} controls src={`data:${r.mimetype};base64,${r.sound}`} />)}
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