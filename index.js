const restify = require('restify');
const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const { WanderMateBot } = require('./bot');
const multer = require('multer');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const axios = require('axios');
require('dotenv').config();

// Create adapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Create memory storage
const memoryStorage = new MemoryStorage();
// Create conversation state
const conversationState = new ConversationState(memoryStorage);

// Create server
const server = restify.createServer();

// Manual CORS setup
server.pre((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.send(200);
    return;
  }
  next();
});
server.opts('/api/messages/file', (req, res, next) => {
    res.send(200);
    next();
  });
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

// Create bot
const bot = new WanderMateBot(adapter, conversationState);

// Setup Multer
const upload = multer({ storage: multer.memoryStorage() });

// Text messages
server.post('/api/messages', async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
});

// File uploads (speech or image)
server.post('/api/messages/file', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400);
      res.json({ error: 'No file uploaded.' });
      return;
    }

    const mimeType = file.mimetype;
    let userText = '';

    if (mimeType.startsWith('audio/')) {
      const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
      speechConfig.speechRecognitionLanguage = 'en-US';
      const pushStream = sdk.AudioInputStream.createPushStream();
      pushStream.write(file.buffer);
      pushStream.close();
      const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      const recognitionResult = await new Promise((resolve) => {
        recognizer.recognizeOnceAsync(result => resolve(result));
      });

      if (recognitionResult.reason === sdk.ResultReason.RecognizedSpeech) {
        userText = `User spoke: ${recognitionResult.text}`;
      } else {
        userText = "User spoke but recognition failed.";
      }
    } else if (mimeType.startsWith('image/')) {
      const response = await axios.post(
        `${process.env.VISION_ENDPOINT}/vision/v3.2/analyze?visualFeatures=Description`,
        file.buffer,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': process.env.VISION_KEY,
            'Content-Type': 'application/octet-stream'
          }
        }
      );
      const caption = response.data.description?.captions?.[0]?.text || "an image";
      userText = `User uploaded image showing: ${caption}`;
    } else {
      res.status(415);
      res.json({ error: 'Unsupported file type.' });
      return;
    }

    await bot.runDirectMessage(userText);
    res.send(200);
  } catch (err) {
    console.error('Error processing file upload:', err);
    res.status(500);
    res.json({ error: 'Internal Server Error' });
  }
});

// Start server
server.listen(process.env.PORT || 3978, () => {
  console.log(`Deakin Travel Assistant (multimodal) bot running at http://localhost:${process.env.PORT || 3978}`);
});