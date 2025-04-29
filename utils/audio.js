const sdk = require('microsoft-cognitiveservices-speech-sdk');

async function transcribeAudio(fileBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.SPEECH_KEY,
        process.env.SPEECH_REGION // e.g., 'eastus'
      );
      speechConfig.speechRecognitionLanguage = 'en-US'; // or whatever language
      speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "10000");
      const pushStream = sdk.AudioInputStream.createPushStream();
      pushStream.write(fileBuffer);
      pushStream.close();

      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognizeOnceAsync((result) => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          resolve(result.text);
        } else {
          console.error('Speech Recognition Failed:', result);
          resolve(null);
        }
      });
    } catch (error) {
      console.error('transcribeAudio() Error:', error);
      reject(error);
    }
  });
}
module.exports = { transcribeAudio };
