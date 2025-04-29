const sdk = require('microsoft-cognitiveservices-speech-sdk');
const fs = require('fs');

// 🔑 Replace with your Azure credentials
const speechKey = process.env.SPEECH_KEY; // Replace with your Azure Speech Service key
const serviceRegion = process.env.SPEECH_REGION; // like 'eastus'

const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, serviceRegion);
speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural'; // You can change voice here

// Save to file instead of playing it
const audioConfig = sdk.AudioConfig.fromAudioFileOutput('/Users/abani/Downloads/harvard.wav');

const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

const text = "This is a test from Azure Speech Services. Hello world!";

synthesizer.speakTextAsync(
    text,
    result => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log("✅ Speech synthesized and saved to 'output.wav'");
        } else {
            console.error("❌ Speech synthesis failed. Reason: ", result.errorDetails);
        }
        synthesizer.close();
    },
    error => {
        console.error("⚠️ Error:", error);
        synthesizer.close();
    }
);
