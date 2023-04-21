async ({ data: { newLink, triggeredByLinkId }, deep, require }) => {
  const detectTextTypeLinkId = await deep.id("@flakeed/google-vision", "DetectText");
  const detectHandwritingTypeLinkId = await deep.id("@flakeed/google-vision", "DetectHandwriting");
  const detectTextInFilesTypeLinkId = await deep.id("@flakeed/google-vision", "DetectTextInFiles");
  const detectLabelsTypeLinkId = await deep.id("@flakeed/google-vision", "DetectLabels");
  const detectLogosTypeLinkId = await deep.id("@flakeed/google-vision", "DetectLogos");
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
    console.log("url", `${ssl ? "https://" : "http://"}${path}/file?linkId=${link.to_id}`);
    const url = `${ssl ? "https://" : "http://"}${path}/file?linkId=${link.to_id}`;

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
    if (newLink.type_id === detectTextTypeLinkId) {
      await processTextDetection(tempImagePath);

      await deep.insert({
        type_id: await deep.id("@flakeed/google-vision", "DetectedText"),
        from_id: triggeredByLinkId,
        to_id: newLink.to_id,
        string: { data: { value: detectedText } },
        in: {
          data: {
            type_id: await deep.id("@deep-foundation/core", "Contain"),
            from_id: triggeredByLinkId
          }
        }
      });
    } else if (newLink.type_id === detectHandwritingTypeLinkId) {
      await processHandwritingDetection(tempImagePath);

      await deep.insert({
        type_id: await deep.id("@flakeed/google-vision", "DetectedText"),
        from_id: triggeredByLinkId,
        to_id: newLink.to_id,
        string: { data: { value: detectedText.text } },
        in: {
          data: {
            type_id: await deep.id("@deep-foundation/core", "Contain"),
            from_id: triggeredByLinkId
          }
        }
      });
    } else if (newLink.type_id === detectTextInFilesTypeLinkId) {
      await processTextIfFilesDetection(tempImagePath);
      await deep.insert({
        type_id: await deep.id("@flakeed/google-vision", "DetectedText"),
        from_id: triggeredByLinkId,
        to_id: newLink.to_id,
        string: { data: { value: detectedText } },
        in: {
          data: {
            type_id: await deep.id("@deep-foundation/core", "Contain"),
            from_id: triggeredByLinkId
          }
        }
      });
    } else if (newLink.type_id === detectLabelsTypeLinkId) {
      await proccesLabelsDetection(tempImagePath);
      await deep.insert({
        type_id: await deep.id("@flakeed/google-vision", "DetectedText"),
        from_id: triggeredByLinkId,
        to_id: newLink.to_id,
        string: { data: { value: JSON.stringify(detectedText) } },
        in: {
          data: {
            type_id: await deep.id("@deep-foundation/core", "Contain"),
            from_id: triggeredByLinkId
          }
        }
      });
    } else if (newLink.type_id === detectLogosTypeLinkId) {
      await proccesLogosDetection(tempImagePath);

      await deep.insert({
        type_id: await deep.id("@flakeed/google-vision", "DetectedText"),
        from_id: triggeredByLinkId,
        to_id: newLink.to_id,
        string: { data: { value: JSON.stringify(detectedText) } },
        in: {
          data: {
            type_id: await deep.id("@deep-foundation/core", "Contain"),
            from_id: triggeredByLinkId
          }
        }
      });
    } else {
      console.error("Invalid type ID.");
    }
  } catch (error) {
    console.error("Error processing image:", error);
  } finally {
    fs.rmSync(keyFilePath, { recursive: true, force: true });
    fs.unlinkSync(tempImagePath);
    fs.rmdirSync(tempDirectory);
  }

  async function processTextDetection(tempImagePath) {
    const client = new vision.ImageAnnotatorClient();

    const [result] = await client.textDetection(tempImagePath);
    detections = result.textAnnotations;

    if (detections && detections.length > 0) {
      detectedText = detections[0].description;
      console.log("Detected text from Google Vision API:", detectedText);
    } else {
      console.log("No text detected or error in the response.");
    }
    return detectedText;
  }

  async function processHandwritingDetection(tempImagePath) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.documentTextDetection(tempImagePath);
    detectedText = result.fullTextAnnotation;
    console.log(detectedText.text);
    return detectedText;
  }

  //** 
  async function processTextIfFilesDetection(tempImagePath) {
      async function setEndpoint() {
        const clientOptions = { apiEndpoint: 'eu-vision.googleapis.com' };
        const client = new vision.ImageAnnotatorClient(clientOptions);
        const [result] = await client.textDetection(tempImagePath);
        detectedText = result.textAnnotations;
        console.log('Text:');
        detectedText.forEach(label => console.log(label.description));
        return detectedText.forEach(label => label.description);
      }
    
      detectedText = await setEndpoint();
      return detectedText;
  }

  async function proccesLabelsDetection(tempImagePath) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.labelDetection(tempImagePath);
    const labels = result.labelAnnotations;
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));
    detectedText = labels.map(label => label.description);
    return detectedText;
  }

  async function proccesLogosDetection(tempImagePath) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.logoDetection(tempImagePath);
    const logos = result.logoAnnotations;
    console.log('Logos:');
    logos.forEach(logo => console.log(logo));
    detectedText = logos.map(logo => logo.description);
    return detectedText;
  }

  return detectedText;
}