async ({ data: { newLink, triggeredByLinkId }, deep, require }) => {
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const userTypeLinkId = await deep.id('@deep-foundation/core', 'User');

  const packageLinkId = await deep.id("@flakeed/google-vision");
  const axios = require("axios");
  const vision = require('@google-cloud/vision');
  const fs = require('fs');
  const os = require('os');
  const { v4: uuid } = require('uuid');
  let detections;
  let detectedText = '';

  async function getPath(deep, link) {
    const ssl = deep.apolloClient.ssl;
    const path = deep.apolloClient.path.slice(0, -4);
    const url = `${ssl ? "https://" : "http://"}${path}/file?linkId=${link.id}`;

    const { data } = await axios({
      method: 'get',
      url,
      headers: {
        'Authorization': `Bearer ${deep.token}`
      },
      responseType: "arraybuffer",
    });

    const baseTempDirectory = os.tmpdir();
    const randomId = uuid();
    const tempDirectory = [baseTempDirectory, randomId].join('/');
    fs.mkdirSync(tempDirectory);

    const imageBuffer = Buffer.from(data, 'binary');
    const tempImagePath = `${tempDirectory}/image.jpg`;
    fs.writeFileSync(tempImagePath, imageBuffer);

    return { tempDirectory, tempImagePath };
  }
  console.log("pathfile", await getPath(deep, newLink));
  const { tempDirectory, tempImagePath } = await getPath(deep, newLink);

  const authFilelinkId = await deep.id("@flakeed/google-vision", "GoogleCloudAuthFile");
  const { data: [{ value: { value: authFile } }] } = await deep.select({ type_id: authFilelinkId });

  const keyFilePath = `${tempDirectory}/key.json`;
  fs.writeFileSync(keyFilePath, JSON.stringify(authFile));

  try {
    process.env["GOOGLE_APPLICATION_CREDENTIALS"] = keyFilePath;

    const client = new vision.ImageAnnotatorClient();

    const [result] = await client.textDetection(tempImagePath);
    detections = result.textAnnotations;

    if (detections && detections.length > 0) {
      detectedText = detections[0].description;
      console.log("Detected text from Google Vision API:", detectedText);
    } else {
      console.log("No text detected or error in the response.");
    }
  } catch (error) {
    console.error("Error processing image:", error);
  } finally {
    fs.rmSync(keyFilePath, { recursive: true, force: true });
    fs.unlinkSync(tempImagePath);
    fs.rmdirSync(tempDirectory);
  }

const detectedTextLinkId = await deep.insert({
  type_id: await deep.id("@flakeed/google-vision", "DetectedText"),
  from_id: triggeredByLinkId,
  to_id:newLink.id,
  string: { data: { value: detectedText } },
  in: {
    data: {
      type_id: await deep.id("@deep-foundation/core", "Contain"),
      from_id: triggeredByLinkId
    }
  }
});

return detectedText;
}