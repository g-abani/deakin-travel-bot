const fetch = require('node-fetch');

const DIRECTLINE_SECRET = process.env.DIRECTLINE_SECRET; // Replace with your Direct Line secret
const PUBLIC_AUDIO_URL = 'https://storage.googleapis.com/kagglesdsdata/datasets/829978/1417968/harvard.wav?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=databundle-worker-v2%40kaggle-161607.iam.gserviceaccount.com%2F20250424%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20250424T225111Z&X-Goog-Expires=345600&X-Goog-SignedHeaders=host&X-Goog-Signature=63470d5311ad871d6e7a49a0fad47113314bf04ab6561666d7b1958790e5591c0c0dbad1fe4354c49b70f40f26f5a7e52f887da7742ebed36bc066ddcbf1a64aec900e62a9f837cc98b359db681411552e91660702903a1fa3599684bf687820962d8d07a58bb62f167639d9a71116b5cd05cd4c0e439b16bea1c6d1c52ce91d9b4536e83050b9328c9612f7c58149b644544bc737c324b54e9c51d40e52b594289a56608a17683d40d4eca111366b3828d431833f3819b7f894a5fe7a0ce49a9b7a157b6ea8eced8440ce51a07d549ca61ea194c1b5083703cf69d1331e2ad0a1f5cffe4a121e7fe7c0cb24f392c84d658ffc81f7476738d299c73062b92901'; // Replace with real accessible audio URL

async function sendAudioMessage() {
  try {
    // 1. Start a conversation
    const startConv = await fetch('https://directline.botframework.com/v3/directline/conversations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIRECTLINE_SECRET}`
      }
    });

    const convData = await startConv.json();
    const conversationId = convData.conversationId;
    console.log('Conversation ID:', conversationId);

    // 2. Send an audio message with attachment
    const activity = {
      type: 'message',
      from: { id: 'user1' },
      attachments: [
        {
          contentType: 'audio/wav',
          contentUrl: PUBLIC_AUDIO_URL,
          name: 'harvard.wav'
        }
      ]
    };

    const postActivity = await fetch(`https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIRECTLINE_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activity)
    });

    const activityResponse = await postActivity.json();
    console.log('Activity response:', activityResponse);
  } catch (err) {
    console.error('Error sending audio message:', err);
  }
}

sendAudioMessage();