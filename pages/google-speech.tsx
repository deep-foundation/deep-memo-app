import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStore } from '@deep-foundation/store/local';
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Provider } from '../imports/provider';
import { Button, ChakraProvider, Stack, Text, Box, Card, Center, CardBody, Heading } from '@chakra-ui/react';
import insertGcloudAuthFile from '../imports/google-speech/insert-gcloud-auth-file';
import installPackage, { PACKAGE_NAME } from '../imports/google-speech/install-package';
import fs from "fs";
import transcribe from '../imports/google-speech/transcribe';

export const delay = (time) => new Promise(res => setTimeout(() => res(null), time));

export async function getStaticProps() {
  const credentials = JSON.parse(fs.readFileSync("./imports/key.json", { encoding: "utf-8" }));
  console.log(credentials);
  return {
    props: {
      credentials
    }
  }
}

function Page({ credentials }) {
  const deep = useDeep();
  const [sounds, setSounds] = useLocalStore('Sounds', [])
  const [deviceLinkId, setDeviceLinkId] = useLocalStore(
    'deviceLinkId',
    undefined
  );

  const loadSounds = async () => {
    const soundTypeLinkId = await deep.id("@deep-foundation/sound", "Sound");
    const formatTypeLinkId = await deep.id("@deep-foundation/sound", "Format");
    const mimetypeTypeLinkId = await deep.id("@deep-foundation/sound", "MIME/type");
    const transcriptionTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcription");
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
                  formatTypeLinkId,
                  mimetypeTypeLinkId,
                  transcriptionTypeLinkId
                ]
            }
          }
        },
      })

      const id = data.filter((link) => link.type_id === soundTypeLinkId)[0].id
      const base64 = data.filter((link) => link.type_id === soundTypeLinkId)[0].value.value
      const format = data.filter((link) => link.type_id === formatTypeLinkId)[0]?.value.value
      const mimetype = data.filter((link) => link.type_id === mimetypeTypeLinkId)[0].value.value
      const transcription = data.filter((link) => link.type_id === transcriptionTypeLinkId)[0]?.value.value
      sounds = [...sounds, { id, base64, mimetype, format, transcription }]
    }
    setSounds(sounds);
  }

  return <Stack justify="center" align="center">
    <Button w='100%' onClick={async () => await installPackage()}>
      INITIALIZE PACKAGE
    </Button>
    <Button w='100%' onClick={async () => await insertGcloudAuthFile(deep, credentials)}>
      INSERT GCLOUD AUTH FILE LINK
    </Button>
    <Button w='100%' onClick={async () => await loadSounds()}>
      LOAD SOUNDS
    </Button>
    {sounds?.map((s) =>
      <Card>
        <CardBody>
          <Stack justify="center" align="center">
            <Heading size='sm'><Text >Sound link id: {s.id}</Text></Heading>
            <audio key={s.id} controls src={`data:${s.mimetype};base64,${s.base64}`} />
            {typeof (s.format) === "string" ? <Heading size='xs'><Text >format: {s.format}</Text></Heading> : null}
            <Heading size='xs'><Text >mimetype: {s.mimetype}</Text></Heading>
            {typeof (s.transcription) === "string" ?
              <Heading size='xs'><Text >transcription: {s.transcription}</Text></Heading> :
              <Button onClick={async () => { await transcribe(deep, [s.id]); await delay(3000); await loadSounds(); }}>transcribe</Button>}
          </Stack>
        </CardBody>
      </Card>
    )}
  </Stack>
}

export default function Index({ credentials }) {
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