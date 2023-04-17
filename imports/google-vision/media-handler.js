async ({ data: { newLink }, deep, require }) => {
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const packageLinkId = await deep.id("@flakeed/google-vision");
  const React = require('react');
  const { useState } = require('react');
  const axios = require("axios");
  const vision = require('@google-cloud/vision');
  const fs = require('fs');
  const os = require('os');
  const { v4: uuid } = require('uuid');


 async function getPath(deep, link) {
    const ssl = deep.apolloClient.ssl;
    console.log("ssl",ssl);
    const path = deep.apolloClient.path.slice(0, -4);
    console.log("path",path);
    const url = `${ssl ? "https://" : "http://"}${path}/file?linkId=${link.id}`;
    console.log("url",url);
    const axios = require("axios")
    const [{ data, loading, error }, refetch] = await axios({
      method: 'get',
      url,
      headers: {
        'Authorization': `Bearer ${deep.token}`
      },
      responseType: 'bobl',
    });
    const [src, setSrc] = useState("test");
    if (!loading && data) {
      const reader = new window.FileReader();
      reader.onload = () => {
        setSrc(reader.result);
      }
      reader.readAsDataURL(data);
    }
// console.log('image-client-handler src', src);
    return src;
  }
  const pathfile = await getPath(deep, newLink);

  const authFilelinkId = await deep.id("@flakeed/google-vision", "GoogleCloudAuthFile");
  const { data: [{ value: { value: authFile } }] } = await deep.select({ type_id: authFilelinkId });

  const baseTempDirectory = os.tmpdir();
  const randomId = uuid();
  const tempDirectory = [baseTempDirectory, randomId].join('/');
  fs.mkdirSync(tempDirectory);
  const keyFilePath = `${tempDirectory}/key.json`;
  fs.writeFileSync(keyFilePath, JSON.stringify(authFile));
  
    try {
      process.env["GOOGLE_APPLICATION_CREDENTIALS"] = keyFilePath;
  
      const client = new vision.ImageAnnotatorClient();

      const request = {
        "requests": [
          {
            "image": {
              "source": {
                "imageUri": pathfile
              }
            },
            "features": [
              {
                "type": "TEXT_DETECTION"
              }
            ],
            "imageContext": {
              "languageHints": ["en"]
            }
          }
        ]
      };
    
      const [result] = await client.batchAnnotateImages(request);
      const detections = result.responses[0].fullTextAnnotation;
      console.log(detections.text);
    
      await deep.insert({
        type_id: await deep.id("@flakeed/google-vision", "PhotoTranscription"),
        string: { data: { value: detections } },
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
    return detections;
}