require('dotenv').config({ path: '../.env' }); // Load environment variables from .env file
const axios = require('axios');

async function testGPT() {
  const endpoint = process.env.OPENAI_ENDPOINT;
  const deploymentId = process.env.OPENAI_DEPLOYMENT_ID;
  const key = process.env.OPENAI_KEY;

  const url = `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=2023-03-15-preview`;
  console.log('🔗 GPT URL:', url);
  try {
    const response = await axios.post(
      url,
      {
        messages: [{ role: 'user', content: 'Suggest a 3-day trip in Manali' }],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'api-key': key,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ GPT response:', response.data.choices[0].message.content);
  } catch (err) {
    console.error('❌ GPT call failed:', err.response?.data || err.message);
  }
}

testGPT();
