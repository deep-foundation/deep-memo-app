import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { CONVERT_AUDIO_PACKAGE_NAME } from "./package-name";

export default async function insertConvertHandler(deep: DeepClient) {
  const fileTypeLinkId = await deep.id("@deep-foundation/core", "SyncTextFile");
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const supportsId = await deep.id("@deep-foundation/core", "dockerSupportsJs");
  const handlerTypeLinkId = await deep.id("@deep-foundation/core", "Handler");
  const packageId = await deep.id(CONVERT_AUDIO_PACKAGE_NAME);
  const handleOperationTypeLinkId = await deep.id("@deep-foundation/core", "HandleInsert");
  const triggerTypeLinkId = await deep.id(CONVERT_AUDIO_PACKAGE_NAME, "Convert");

  const code = /*javascript*/`async ({ require, deep, data: { newLink } }) => {
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    const ffprobePath = require('@ffprobe-installer/ffprobe').path;
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
  
    const soundTypelinkId = await deep.id("@deep-foundation/sound", "Sound");
    const formatTypelinkId = await deep.id("@deep-foundation/sound", "Format");
    const mimetypeTypelinkId = await deep.id("@deep-foundation/sound", "MIME/type");
  
      const { data } = await deep.select({
      up: {
        parent: {
          id: newLink.from_id
        },
        link: {
          type_id: {
            _in:
              [
                mimetypeTypelinkId,
                formatTypelinkId,
                soundTypelinkId
              ]
          }
        }
      },
    });
  
    const soundLink = data.filter((link) => link.type_id === soundTypelinkId);;
    const mimetypeLink = data.filter((link) => link.type_id === mimetypeTypelinkId);
    const formatLink = data.filter((link) => link.type_id === formatTypelinkId);
  
    const soundBase64 = soundLink.value.value;
  
    const soundBase64 = soundLink.value.value;
  
    function convertBase64ToAudioBuffer(base64String) {
      return Buffer.from(base64String, 'base64');
    }
  
    async function convertWebmOpusToFlac(inputBuffer) {
      return new Promise((resolve, reject) => {
        const outputBuffer = Buffer.alloc(0);
  
        ffmpeg()
          .input(inputBuffer)
          .inputFormat('webm')
          .audioCodec('opus')
          .outputFormat('flac')
          .on('error', (err) => {
            reject(err);
          })
          .on('data', (chunk) => {
            outputBuffer = Buffer.concat([outputBuffer, chunk]);
          })
          .on('end', () => {
            resolve(outputBuffer);
          })
          .run();
      });
    }
  
    try {
      const inputBuffer = convertBase64ToAudioBuffer(soundBase64);
      const converted = await convertWebmOpusToFlac(inputBuffer);
  
      await deep.insert({
        type_id: soundTypelinkId,
        object: { data: { value: converted.toString('base64') } },
        in: {
          data: {
            type_id: await deep.id("@deep-foundation/core", "Contain"),
            from_id: newLink.from_id
          }
        }
      });
    } catch (err) {
      console.error(\`Error while converting audio: \${err.message}\`);
    }
  }
  `

  await deep.insert({
    type_id: fileTypeLinkId,
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: packageId,
          string: { data: { value: "HandlerCode" } },
        },
        {
          from_id: supportsId,
          type_id: handlerTypeLinkId,
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: packageId,
                string: { data: { value: "AudioConvertHandler" } },
              },
              {
                type_id: handleOperationTypeLinkId,
                from_id: triggerTypeLinkId,
                in: {
                  data: [
                    {
                      type_id: containTypeLinkId,
                      from_id: packageId,
                      string: { data: { value: "HandleAudioConversion" } },
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
  console.log("Audio Conversion handler inserted");
}