
// function main() {
//   // [START speech_v1_generated_Speech_Recognize_async]
//   /**
//    * This snippet has been automatically generated and should be regarded as a code template only.
//    * It will require modifications to work.
//    * It may require correct/in-range values for request initialization.
//    * TODO(developer): Uncomment these variables before running the sample.
//    */
//   /**
//    *  Required. Provides information to the recognizer that specifies how to
//    *  process the request.
//    */
//   // const config = {}
//   /**
//    *  Required. The audio data to be recognized.
//    */
//   // const audio = {}

//   // Imports the Speech library
//   const { SpeechClient } = require('@google-cloud/speech').v1;

//   // Instantiates a client
//   const speechClient = new SpeechClient();

//   async function callRecognize() {
//     // Construct request
//     // The path to the remote LINEAR16 file
//     const gcsUri = 'gs://cloud-samples-data/speech/brooklyn_bridge.raw';

//     // The audio file's encoding, sample rate in hertz, and BCP-47 language code
//     const audio = {
//       uri: gcsUri,
//     };
//     const config = {
//       encoding: 'LINEAR16',
//       sampleRateHertz: 16000,
//       languageCode: 'en-US',
//     };
//     const request = {
//       audio: audio,
//       config: config,
//     };


//     // Run request
//     const response = await speechClient.recognize(request);

//     const transcription = response[0].results.map(result => result.alternatives[0].transcript).join('\n');
//     console.log(`Transcription: ${transcription}`);
//   }

//   callRecognize();
//   // [END speech_v1_generated_Speech_Recognize_async]
// }

// process.on('unhandledRejection', err => {
//   console.error(err.message);
//   process.exitCode = 1;
// });
// main(...process.argv.slice(2));

const axios = require("axios");

axios.post('https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyDV-Tk1MBiKkTa4H2CYtlIHUo7zcCT-fpo', {}, { 
  headers: {
    "Authorization": "Bearer ya29.a0AVvZVsp3WkJFi6DQXvhpnOFTbdV0-BycV8zaD2MVt1wWIx3ey40AlZbYFW8ocIzvLBBSQ0QWJCCQGTTO4JvVqafn3c2HoaN59Z0zjGXaZTDJFEwYtXvdRnnyUlLrCfwU_CFXibNSEoWLUkRCBJ2u52gtMNsvYp1KAya9FAaCgYKAYoSAQASFQGbdwaIc668AsjHAQ0q9f9dt5h94A0173",
    "X-goog-api-key": "AIzaSyDV-Tk1MBiKkTa4H2CYtlIHUo7zcCT-fpo",
  }
})
.then(function (response) {
  console.log(response);
})
.catch(function (error) {
  console.log(error);
});

