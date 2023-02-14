import { DeepClient } from "@deep-foundation/deeplinks/imports/client";

export default async function insertSoundHandler(deep: DeepClient) {
  const fileTypeLinkId = await deep.id("@deep-foundation/core", "SyncTextFile");
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const supportsId = await deep.id("@deep-foundation/core", "dockerSupportsJs");
  const handlerTypeLinkId = await deep.id("@deep-foundation/core", "Handler");
  const packageId = await deep.id("@deep-foundation/sound-handler");
  const handleOperationTypeLinkId = await deep.id("@deep-foundation/core", "HandleInsert")
  const triggerTypeLinkId = await deep.id("@deep-foundation/audiorecord", "AudioChunk")

  const code = /*javascript*/`async ({ require, deep, data: { newLink } }) => {
    const speech = require('@google-cloud/speech');
    await deep.insert({
      type_id: await deep.id("@deep-foundation/sound-handler", "SoundHandlerOutput"), 
      string: { data: { value: speech.toString()} },
      in: {
        data: {
          type_id: await deep.id("@deep-foundation/core", "Contain"),
          from_id: newLink.id
        }
      }
    })
  }`

  await deep.insert({
    type_id: fileTypeLinkId,
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: packageId,
          string: { data: { value: "SoundScript" } },
        },
        {
          from_id: supportsId,
          type_id: handlerTypeLinkId,
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: packageId,
                string: { data: { value: "SoundHandler" } },
              },
              {
                type_id: handleOperationTypeLinkId,
                from_id: triggerTypeLinkId,
                in: {
                  data: [
                    {
                      type_id: containTypeLinkId,
                      from_id: packageId,
                      string: { data: { value: "HandleSoundInsert" } },
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
  console.log("sound hanler inserted");
  
}