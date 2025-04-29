const axios = require('axios');

const endpoint = 'https://4832-language-service.cognitiveservices.azure.com';
const apiKey = process.env.CLU_API_KEY; // Replace with your CLU API key
const projectName = process.env.CLU_PROJECT_NAME; // Replace with your CLU project name
const deploymentName = process.env.CLU_DEPLOYMENT_NAME; // Replace with your CLU deployment name
const inputText = 'I need a flight from Delhi to Goa on May 15';

const url = `${endpoint}/language/:analyze-conversations?api-version=2024-11-15-preview`;

const headers = {
    'Ocp-Apim-Subscription-Key': apiKey,
    'Content-Type': 'application/json'
};

const payload = {
    kind: 'Conversation',
    analysisInput: {
        conversationItem: {
            id: '1',
            participantId: 'user1',
            modality: 'text',
            language: 'en',
            text: inputText
        }
    },
    parameters: {
        projectName: projectName,
        deploymentName: deploymentName,
        verbose: true
    }
};

axios.post(url, payload, { headers })
    .then(response => {
        console.log('Success 🎉');
        console.log(JSON.stringify(response.data, null, 2));
    })
    .catch(error => {
        console.error('CLU Error 😞');

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    });
