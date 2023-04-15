import { DeepClient } from "@deep-foundation/deeplinks/imports/client";

export default async function insertSoundHandler(deep: DeepClient) {
  const fileTypeLinkId = await deep.id("@deep-foundation/core", "SyncTextFile");
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const supportsId = await deep.id("@deep-foundation/core", "dockerSupportsJs");
  const handlerTypeLinkId = await deep.id("@deep-foundation/core", "Handler");
  const packageId = await deep.id("@deep-foundation/google-speech");
  const handleOperationTypeLinkId = await deep.id("@deep-foundation/core", "HandleInsert");
  const triggerTypeLinkId = await deep.id("@deep-foundation/google-speech", "Transcribe");

  const code = /*javascript*/`async ({ require, deep, data: { newLink } }) => {
    const speech = require('@google-cloud/speech');
    const fs = require('fs');
    const os = require('os');
    const { v4: uuid } = require('uuid');
  
    const soundTypelinkId = await deep.id("@deep-foundation/sound", "Sound");
    const mimetypeTypelinkId = await deep.id("@deep-foundation/sound", "MIME/type");
  
    const { data } = await deep.select({
      up: {
        parent: {
          id: newLink.to_id
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
  
    const authFilelinkId = await deep.id("@deep-foundation/google-speech", "GoogleCloudAuthFile");
    const { data: [{ value: { value: authFile } }] } = await deep.select({ type_id: authFilelinkId });
  
    const baseTempDirectory = os.tmpdir();
    const randomId = uuid();
    const tempDirectory = [baseTempDirectory, randomId].join('/');
    fs.mkdirSync(tempDirectory);
    const keyFilePath = \`\${tempDirectory}/key.json\`;
    fs.writeFile(keyFilePath, JSON.stringify(authFile), (error) => {
      if (error) throw error;
    })
  
    try {
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
        type_id: await deep.id("@deep-foundation/google-speech", "GoogleSpeechTranscription"),
        string: { data: { value: transcription } },
        in: {
          data: {
            type_id: await deep.id("@deep-foundation/core", "Contain"),
            from_id: newLink.to_id
          }
        }
      })
    } 
    finally {
      fs.rmSync(keyFilePath, { recursive: true, force: true });
    }
  }`

  await deep.insert({
    type_id: fileTypeLinkId,
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: packageId,
          string: { data: { value: "GcloudSpeechHandlerCode" } },
        },
        {
          from_id: supportsId,
          type_id: handlerTypeLinkId,
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: packageId,
                string: { data: { value: "GcloudSpeechHandler" } },
              },
              {
                type_id: handleOperationTypeLinkId,
                from_id: triggerTypeLinkId,
                in: {
                  data: [
                    {
                      type_id: containTypeLinkId,
                      from_id: packageId,
                      string: { data: { value: "HandleTranscription" } },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    string: {
      data: {
        value: code,
      },
    },
  });
  console.log("Transcription handler inserted");
}