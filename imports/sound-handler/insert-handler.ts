import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./install-package";
import { generateApolloClient } from '@deep-foundation/hasura/client';
import * as dotenv from 'dotenv';
import fs from "fs";
import path from "path"
import { MutationInputLink } from "@deep-foundation/deeplinks/imports/client_types";
dotenv.config();

const code = /*javascript*/`async ({ require, deep, data: { newLink } }) => {
  const speech = require('@google-cloud/speech');
  const fs = require('fs');
  const os = require('os');
  const { v4: uuid } = require('uuid');

  const soundTypelinkId = await deep.id("@deep-foundation/audiorecord", "Sound");
  const mimetypeTypelinkId = await deep.id("@deep-foundation/audiorecord", "MIME/type");

  const { data } = await deep.select({
    up: {
      parent: {
        id: newLink.id
      },
      link: {
        type_id: {
          _in:
            [
              soundTypelinkId,
              mimetypeTypelinkId
            ]
        }
      }
    },
  });

  const soundLink = data.filter((link) => link.type_id === soundTypelinkId)
  const mimetypeLink = data.filter((link) => link.type_id === mimetypeTypelinkId)

  const authFilelinkId = await deep.id("@deep-foundation/sound-handler", "GoogleCloudAuthFile");
  const { data: [{ value: { value: authFile } }] } = await deep.select({ type_id: authFilelinkId });

  const baseTempDirectory = os.tmpdir();
  const randomId = uuid();
  const tempDirectory = [baseTempDirectory, randomId].join('/');
  fs.mkdirSync(tempDirectory);
  const keyFilePath = \`\${tempDirectory}/key.json\`;
  fs.writeFile(keyFilePath, JSON.stringify(authFile), (error) => {
    if (error) throw error;
  })

  process.env["GOOGLE_APPLICATION_CREDENTIALS"] = keyFilePath;

  const client = new speech.SpeechClient();

  const audio = {
    content: soundLink[0].value.value,
  };
  const config = {
    encoding: mimetypeLink[0].value.value === 'audio/webm;codecs=opus' ? 'WEBM_OPUS' : 'LINEAR16',
    sampleRateHertz: 48000,
    languageCode: 'ru-RU',
  };
  const request = {
    audio: audio,
    config: config,
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\\n');

  await deep.insert({
    type_id: await deep.id("@deep-foundation/sound-handler", "GoogleSpeechTranscription"),
    string: { data: { value: transcription } },
    in: {
      data: {
        type_id: await deep.id("@deep-foundation/core", "Contain"),
        from_id: newLink.id
      }
    }
  })

  fs.rmSync(keyFilePath, { recursive: true, force: true });
}`

export default async function insertHandler() {

  const apolloClient = generateApolloClient({
    path: process.env.NEXT_PUBLIC_GQL_PATH || '', // <<= HERE PATH TO UPDATE
    ssl: !!~process.env.NEXT_PUBLIC_GQL_PATH.indexOf('localhost')
      ? false
      : true,
    // admin token in prealpha deep secret key
    // token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsibGluayJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJsaW5rIiwieC1oYXN1cmEtdXNlci1pZCI6IjI2MiJ9LCJpYXQiOjE2NTYxMzYyMTl9.dmyWwtQu9GLdS7ClSLxcXgQiKxmaG-JPDjQVxRXOpxs',
  });

  const unloginedDeep = new DeepClient({ apolloClient });
  const guest = await unloginedDeep.guest();
  const guestDeep = new DeepClient({ deep: unloginedDeep, ...guest });
  const admin = await guestDeep.login({
    linkId: await guestDeep.id('deep', 'admin'),
  });
  const deep = new DeepClient({ deep: guestDeep, ...admin });

  const syncTextFileTypeLinkId = await deep.id("@deep-foundation/core", "SyncTextFile")
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain")
  const supportsJsLinkId = await deep.id("@deep-foundation/core", "dockerSupportsJs" /* | "plv8SupportsJs" */)
  const handlerTypeLinkId = await deep.id("@deep-foundation/core", "Handler")
  const handleOperationLinkId = await deep.id("@deep-foundation/core", "HandleInsert" /* | HandleUpdate | HandleDelete */);
  const reservedIds = await deep.reserve(2);
  const packageLinkId = await deep.id("@deep-foundation/sound-handler");
  const triggerTypeLinkId = await deep.id("@deep-foundation/audiorecord", "Record");

  const syncTextFileInsertData: MutationInputLink = {
    id: reservedIds.pop(),
    type_id: syncTextFileTypeLinkId,
    string: {
      data: {
        value: code // fs.readFileSync(path.join(__dirname, 'gcloudSpeechInsertHandler.js'), { encoding: 'utf-8' }), // Handler file must contain async function like this: async ({deep, data: {oldLink, newLink, triggeredByLinkId}}) => {}
      },
    },
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: "GcloudSpeechClientCode" } },
      }
    }
  }

  const handlerInsertData: MutationInputLink = {
    id: reservedIds.pop(),
    type_id: handlerTypeLinkId,
    from_id: supportsJsLinkId,
    to_id: syncTextFileInsertData.id,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: "GcloudSpeechHandler" } },
      }
    }
  };

  const handleOperationData: MutationInputLink = {
    type_id: handleOperationLinkId,
    from_id: triggerTypeLinkId,
    to_id: handlerInsertData.id,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: "HandleTranscription" } },
      }
    }
  }

  await deep.insert([
    syncTextFileInsertData,
    handlerInsertData,
    handleOperationData
  ])
}