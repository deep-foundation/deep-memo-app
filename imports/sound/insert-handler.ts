import { DeepClient } from "@deep-foundation/deeplinks/imports/client";

export default async function insertAudioMetadataHandler(deep: DeepClient) {
  const fileTypeLinkId = await deep.id("@deep-foundation/core", "SyncTextFile");
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const supportsId = await deep.id("@deep-foundation/core", "dockerSupportsJs");
  const handlerTypeLinkId = await deep.id("@deep-foundation/core", "Handler");
  const packageId = await deep.id("@deep-foundation/sound");
  const handleOperationTypeLinkId = await deep.id("@deep-foundation/core", "HandleInsert");
  const triggerTypeLinkId = await deep.id("@deep-foundation/core", "AsyncFile");

  const code = /*javascript*/`async ({ require, deep, data: { newLink } }) => {
    const mm = require('music-metadata-browser');
    const axios = require("axios");
  
    const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain")
    const mimetypeTypeLinkId = await deep.id("@deep-foundation/sound", "MIME/type");
    const formatTypeLinkId = await deep.id("@deep-foundation/sound", "Format");
    const sampleRateTypeLinkId = await deep.id("@deep-foundation/sound", "SampleRate");
    const codecTypeLinkId = await deep.id("@deep-foundation/sound", "Codec");
  
    const ssl = deep.apolloClient.ssl;
    const path = deep.apolloClient.path.slice(0, -4);
    console.log("url", \`\${ssl ? "https://" : "http://"}\${path}/file?linkId=\${newLink.id}\`);
    const url = \`\${ssl ? "https://" : "http://"}\${path}/file?linkId=\${newLink.id}\`;
  
    const { data } = await axios({
      method: 'get',
      url,
      headers: {
        'Authorization': \`Bearer \${deep.token}\`
      },
      responseType: "arraybuffer",
    });
    console.log("link_id:", newLink.id);
  
    const fileNameTypeSelect = await deep.select(
      {
        link_id: {
          _eq: link.to_id
        }
      },
      {
        table: 'files',
        returning: \`link_id name mimeType\`
      });
    console.log("fileNameTypeSelect:", fileNameTypeSelect);
  
    const fileName = fileNameTypeSelect.data[0].name;
    const mimeType = fileNameTypeSelect.data[0].mimeType;
    const audioBuffer = Buffer.from(data, 'binary');
  
    try {
      const metadata = await mm.parseBlob(new Blob([audioBuffer], { type: mimeType }));
      
      const { format } = metadata;
  
      await deep.insert([
        {
          type_id: mimetypeTypeLinkId,
          string: { data: { value: mimeType } },
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: newLink.id
            }
          }
        },
        {
          type_id: formatTypeLinkId,
          string: { data: { value: format.formatName } },
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: newLink.id
            }
          }
        },
        {
          type_id: codecTypeLinkId,
          string: { data: { value: format.codec } },
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: newLink.id
            }
          }
        },
        {
          type_id: sampleRateTypeLinkId,
          string: { data: { value: format.sampleRate } },
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: newLink.id
            }
          }
        }
      ])
    
      return metadata;
    } catch (error) {
      console.error("Error parsing audio metadata:", error);
    }
  }`

  await deep.insert({
    type_id: fileTypeLinkId,
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: packageId,
          string: { data: { value: "MetadataHandlerCode" } },
        },
        {
          from_id: supportsId,
          type_id: handlerTypeLinkId,
          in: {
            data: [
              {
                type_id: containTypeLinkId,
                from_id: packageId,
                string: { data: { value: "MetadataHandler" } },
              },
              {
                type_id: handleOperationTypeLinkId,
                from_id: triggerTypeLinkId,
                in: {
                  data: [
                    {
                      type_id: containTypeLinkId,
                      from_id: packageId,
                      string: { data: { value: "HandleMetadata" } },
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
  console.log("Metadata handler inserted");
}