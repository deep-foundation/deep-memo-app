async ({ data: { newLink, triggeredByLinkId }, deep, require }) => {
  const detectTextTypeLinkId = await deep.id("@flakeed/google-vision", "DetectText");
  const detectHandwritingTypeLinkId = await deep.id("@flakeed/google-vision", "DetectHandwriting");
  const detectTextInFilesTypeLinkId = await deep.id("@flakeed/google-vision", "DetectTextInFiles");
  const detectLabelsTypeLinkId = await deep.id("@flakeed/google-vision", "DetectLabels");
  const detectLogosTypeLinkId = await deep.id("@flakeed/google-vision", "DetectLogos");
  const axios = require("axios");
  const vision = require('@google-cloud/vision');
  const { Storage } = require('@google-cloud/storage');
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
    console.log("link_id:", link.to_id);

    const baseTempDirectory = os.tmpdir();
    const randomId = uuid();
    const tempDirectory = [baseTempDirectory, randomId].join('/');
    fs.mkdirSync(tempDirectory);

    const fileNameSelect = await deep.select(
      {
        link_id: {
          _eq: link.to_id
        }
      },
      {
        table: 'files',
        returning: `link_id name mimeType`
      });
    console.log("fileNameSelect:", fileNameSelect);
    const fileName = fileNameSelect.data[0].name;
    const fileType = fileNameSelect.data[0].mimeType;
    const imageBuffer = Buffer.from(data, 'binary');
    const tempPath = `${tempDirectory}/${fileName}`;
    fs.writeFileSync(tempPath, imageBuffer);

    return { tempDirectory, tempPath, fileType, fileName };
  }
  console.log("pathfile", await getPath(deep, newLink));
  const { tempDirectory, tempPath, fileType, fileName } = await getPath(deep, newLink);

  const authFilelinkId = await deep.id("@flakeed/google-vision", "GoogleCloudAuthFile");
  const { data: [{ value: { value: authFile } }] } = await deep.select({ type_id: authFilelinkId });

  const keyFilePath = `${tempDirectory}/key.json`;
  fs.writeFileSync(keyFilePath, JSON.stringify(authFile));

  try {
    process.env["GOOGLE_APPLICATION_CREDENTIALS"] = keyFilePath;
    if (newLink.type_id === detectTextTypeLinkId) {
      await processTextDetection(tempPath);

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
      await processHandwritingDetection(tempPath);

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
      await processTextIfFilesDetection(fileType, fileName);
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
      await proccesLabelsDetection(tempPath);
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
      await proccesLogosDetection(tempPath);

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
    fs.unlinkSync(tempPath);
    fs.rmdirSync(tempDirectory);
  }

  async function processTextDetection(tempPath) {
    const client = new vision.ImageAnnotatorClient();

    const [result] = await client.textDetection(tempPath);
    detections = result.textAnnotations;

    if (detections && detections.length > 0) {
      detectedText = detections[0].description;
      console.log("Detected text from Google Vision API:", detectedText);
    } else {
      console.log("No text detected or error in the response.");
    }
    return detectedText;
  }

  async function processHandwritingDetection(tempPath) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.documentTextDetection(tempPath);
    detectedText = result.fullTextAnnotation;
    console.log(detectedText.text);
    return detectedText;
  }
  
  async function processTextIfFilesDetection(selectedFileType, selectedFileName) {
    const vision = require('@google-cloud/vision').v1;
    const client = new vision.ImageAnnotatorClient();
    const storage = new Storage();
  
    const bucketName = 'media-handler-vision';
    const fileName = selectedFileName;
  
    const gcsSourceUri = `gs://${bucketName}/${fileName}`;
    const gcsDestinationUri = `gs://${bucketName}/${selectedFileName}-output.json`;
  
    const inputConfig = {
      mimeType: selectedFileType,
      gcsSource: {
        uri: gcsSourceUri,
      },
    };
    const outputConfig = {
      gcsDestination: {
        uri: gcsDestinationUri,
      },
    };
    const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }];
    const request = {
      requests: [
        {
          inputConfig: inputConfig,
          features: features,
          outputConfig: outputConfig,
        },
      ],
    };
  
    const [operation] = await client.asyncBatchAnnotateFiles(request);
    const [filesResponse] = await operation.promise();
    const destinationUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
    console.log('Json saved to: ' + destinationUri);
  
    // Download the JSON file
    const outputFile = storage.bucket(bucketName).file(`${selectedFileName}-output.json`);
    console.log(`Output JSON file saved to: ${outputFile}`);
  
    const localOutputPath = './downloaded-result.json';
    await outputFile.download({ destination: localOutputPath });
    console.log(`Output JSON file downloaded from: ${outputFile} to: ${localOutputPath}`);
  
    // Read the JSON file and extract the detected text
  const outputFileContent = await fs.promises.readFile(localOutputPath, 'utf-8');
  const outputJson = JSON.parse(outputFileContent);
  const responses = outputJson.responses;
  detectedText = '';

  responses.forEach(response => {
    const pages = response.fullTextAnnotation.pages;
    pages.forEach(page => {
      const blocks = page.blocks;
      blocks.forEach(block => {
        const paragraphs = block.paragraphs;
        paragraphs.forEach(paragraph => {
          const words = paragraph.words;
          words.forEach(word => {
            const symbols = word.symbols;
            symbols.forEach(symbol => {
              detectedText += symbol.text;
            });
            detectedText += ' ';
          });
        });
        detectedText += '\n';
      });
    });
  });

  return detectedText;
}


  async function proccesLabelsDetection(tempPath) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.labelDetection(tempPath);
    const labels = result.labelAnnotations;
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));
    detectedText = labels.map(label => label.description);
    return detectedText;
  }

  async function proccesLogosDetection(tempPath) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.logoDetection(tempPath);
    const logos = result.logoAnnotations;
    console.log('Logos:');
    logos.forEach(logo => console.log(logo));
    detectedText = logos.map(logo => logo.description);
    return detectedText;
  }

  return detectedText;
}