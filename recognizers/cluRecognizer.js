const axios = require('axios');

async function recognizeCLU(inputText) {
    const endpoint = process.env.CLU_ENDPOINT;
    const key = process.env.CLU_KEY;
    const projectName = process.env.CLU_PROJECT_NAME;
    const deploymentName = process.env.CLU_DEPLOYMENT_NAME;
    const url = `${endpoint}language/:analyze-conversations?api-version=2024-11-15-preview`;

    const response = await axios.post(
        url,
        {
            kind: 'Conversation',
            analysisInput: {
                conversationItem: {
                    id: '1',
                    participantId: 'user1',
                    modality: 'text',
                    language: 'en',
                    text: inputText,
                }
            },
            parameters: {
                projectName: projectName,
                deploymentName: deploymentName,
                verbose: true
            }
        },
        {
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data.result;
}

module.exports = { recognizeCLU };
