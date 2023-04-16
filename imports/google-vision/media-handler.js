async ({ data: { newLink }, deep, require }) => {
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const packageLinkId = await deep.id("@flakeed/google-vision");

  const vision = require('@google-cloud/vision');
  const fs = require('fs');
  const os = require('os');
  const { v4: uuid } = require('uuid');

  // const videoTypelinkId = await deep.id("@flakeed/google-vision", "Video");
  // const photoTypelinkId = await deep.id("@flakeed/google-vision", "Photo");

  // const { data } = await deep.select({

  // });

  // const soundLink = data.filter((link) => link.type_id === soundTypelinkId)
  // const mimetypeLink = data.filter((link) => link.type_id === mimetypeTypelinkId)

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
                "imageUri": "https://thumbs.dreamstime.com/b/banner-hello-june-new-season-welcome-card-photo-sunset-field-evening-sky-sun-horizon-text-149326476.jpg"
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