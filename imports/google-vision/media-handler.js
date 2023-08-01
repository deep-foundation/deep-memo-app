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
  let detectedText='';

  console.log("pathfile", await getPath(deep, newLink));
  const { tempDirectory, tempPath, fileType, fileName } = await getPath(deep, newLink);

  const authFilelinkId = await deep.id("@flakeed/google-vision", "GoogleCloudAuthFile");
  const { data: [{ value: { value: authFile } }] } = await deep.select({ type_id: authFilelinkId });

  const keyFilePath = `${tempDirectory}/key.json`;
  fs.writeFileSync(keyFilePath, JSON.stringify(authFile));

  try {
    process.env["GOOGLE_APPLICATION_CREDENTIALS"] = keyFilePath;
    if (newLink.type_id === detectTextTypeLinkId) {
      detectedText = await processTextDetection(tempPath);

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
      detectedText = await processHandwritingDetection(tempPath);

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
      detectedText=await processTextIfFilesDetection(fileType, fileName);
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
      detectedText = await proccesLabelsDetection(tempPath);
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
      detectedText = await proccesLogosDetection(tempPath);

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
  const {promisify} = require('util');
  const glob = promisify(require('glob'));

  const bucketName = 'media-handler-vision';
  const fileName = selectedFileName;

  const gcsSourceUri = `gs://${bucketName}/${fileName}`;
  
  const inputConfig = {
    mimeType: selectedFileType,
    gcsSource: {
      uri: gcsSourceUri,
    },
  };
  console.log("inputConfig",inputConfig)
  const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }];
  
  let allResponses = [];

  const pagesCount = 100; 
  const pagesPerBatch = 5; 
  const numberOfBatches = Math.ceil(pagesCount / pagesPerBatch);

  for (let i = 0; i < numberOfBatches; i++) {
    const gcsDestinationUri = `gs://${bucketName}/${selectedFileName}-output-${i}.json`;
console.log("gcsDestinationUri",gcsDestinationUri)
    const outputConfig = {
      gcsDestination: {
        uri: gcsDestinationUri,
      },
    };
    console.log("outputConfig",outputConfig)

    const request = {
      requests: [
        {
          inputConfig: inputConfig,
          features: features,
          outputConfig: outputConfig,
        },
      ],
    };
    console.log("request",request)

    const [operation] = await client.asyncBatchAnnotateFiles(request);
    await operation.promise();
    console.log("operation",operation)
    await new Promise(resolve => setTimeout(resolve, 5000));
    setTimeout(async () => {
      const jsonFiles = await glob(`${selectedFileName}-output-${i}.json*`);
console.log("jsonFiles",jsonFiles)
      await Promise.all(jsonFiles.map(async (jsonFile) => {
        console.log("4")
        const outputFile = storage.bucket(bucketName).file(jsonFile);
        console.log("outputFile",outputFile)
        const localOutputPath = `./${jsonFile}`;
        await outputFile.download({ destination: localOutputPath });

        const outputFileContent = await fs.promises.readFile(localOutputPath, 'utf8');
        console.log("outputFileContent",outputFileContent)
        console.log("5")
        const outputJson = JSON.parse(outputFileContent);
        console.log("outputJson",outputJson)
        const responses = outputJson.responses;
        console.log("responses",responses)
        responses.forEach(response => {
          const text = response.fullTextAnnotation.text;
          allResponses.push(text);
          console.log("3")
        });
      }));
    }, 5000);
  }
console.log("allResponses",allResponses)
  fs.writeFileSync('./allPages.json', JSON.stringify(allResponses));

  return allResponses.join('');
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

  return detectedText;
}
