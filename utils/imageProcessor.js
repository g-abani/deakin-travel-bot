
require('dotenv').config();
const axios = require('axios');

async function analyzeImage(fileBuffer) {
  const endpoint = process.env.CUSTOM_VISION_ENDPOINT;
  const predictionKey = process.env.CUSTOM_VISION_PREDICTION_KEY;
  const projectId = process.env.CUSTOM_VISION_PROJECT_ID;
  const publishedName = process.env.CUSTOM_VISION_PUBLISHED_NAME;

  try {
    const response = await axios.post(
      `${endpoint}/customvision/v3.0/Prediction/${projectId}/classify/iterations/${publishedName}/image`,
      fileBuffer,
      {
        headers: {
          'Prediction-Key': predictionKey,
          'Content-Type': 'application/octet-stream'
        }
      }
    );

    const predictions = response.data.predictions;
    if (predictions && predictions.length >= 2) {
        // Sort by highest probability
        predictions.sort((a, b) => b.probability - a.probability);
  
        const cityTag = predictions[0]?.tagName || '';
        const landscapeTag = predictions[1]?.tagName || '';
  
        // Combine nicely
        return `${cityTag} ${landscapeTag}`.trim();
      } else if (predictions.length === 1) {
        return `${predictions[0].tagName}`.trim();
      } else {
        return 'Unknown City and Landscape';
      }
  } catch (error) {
    console.error('Custom Vision Prediction Error:', error);
    return null;
  }
}

module.exports = { analyzeImage };