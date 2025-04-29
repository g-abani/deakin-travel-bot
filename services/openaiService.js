const axios = require('axios');

async function generateGPTResponse(messages) {
    console.log("messages:", messages);
    const endpoint = process.env.OPENAI_ENDPOINT;
    const key = process.env.OPENAI_KEY;
    const deploymentId = process.env.OPENAI_DEPLOYMENT_ID;

    const url = `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=2024-04-01-preview`;

    const response = await axios.post(
        url,
        {
            messages: [
                { role: "system", content: "You are a helpful travel assistant." },
                ...messages
              ],
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

    return response.data.choices[0].message.content;
}

module.exports = { generateGPTResponse };  // ✅ Make sure this is here
