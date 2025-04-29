const sdk = require('microsoft-cognitiveservices-speech-sdk');
const path = require('path');
const fs = require('fs');

// 🔑 Replace with your Azure credentials
const speechKey = process.env.SPEECH_KEY;
const serviceRegion = process.env.SPEECH_REGION; // e.g., 'eastus'

// Path to your audio file
const audioFilePath = path.resolve("/Users/abani/Downloads", 'harvard.wav');

const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, serviceRegion);
speechConfig.speechRecognitionLanguage = 'en-US';

// Use audio file instead of mic
const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(audioFilePath));

const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

console.log(`🎧 Transcribing: ${audioFilePath} ...`);

recognizer.recognizeOnceAsync(result => {
    if (result.reason === sdk.ResultReason.RecognizedSpeech) {
        console.log(`✅ Recognized: ${result.text}`);
    } else {
        console.error(`❌ Error: ${result.errorDetails}`);
    }
    recognizer.close();
});
