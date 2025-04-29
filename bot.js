const { ActivityHandler, TurnContext } = require('botbuilder');
const { recognizeCLU } = require('./recognizers/cluRecognizer');
const { generateGPTResponse } = require('./services/openaiService');
const { transcribeAudio } = require('./utils/audio');
const { analyzeImage } = require('./utils/imageProcessor');

class WanderMateBot extends ActivityHandler {
  constructor(adapter, conversationState) {
    super();
    this.adapter = adapter;
    this.conversationState = conversationState;
    this.historyAccessor = conversationState.createProperty('history');
    this.onMessage(async (context, next) => {
      let userInput = context.activity.text;
      let imageDescription = null;
      
      // Added snippet to handle file uploads
      if (context.activity.attachments && context.activity.attachments.length > 0) {
        const attachment = context.activity.attachments[0];
        const fileBuffer = await downloadAttachment(attachment.contentUrl, context.adapter.credentials.appPassword);
        
        if (attachment.contentType.startsWith('audio/')) {
            console.log("Audio file detected");
            const speechText = await transcribeAudio(fileBuffer);
            userInput = speechText || "Audio could not be transcribed.";
            console.log("userInput", userInput);
        } else if (attachment.contentType.startsWith('image/')) {
            console.log("Image file detected");

            try {
                imageDescription = await analyzeImage(fileBuffer);
                console.log("Image description received:", imageDescription);
            } catch (err) {
                console.error("Error during analyzeImage:", err);
                userInput = "Image could not be analyzed due to Vision API error.";
            }
        } else {
          userInput = 'Hello! I am looking for a holiday trip';
        }
      }
    
      console.log("userInput", userInput);
      const history = await this.historyAccessor.get(context, []);

      let cluResult;
      let topIntent = 'unknown';
      let entities = {};

      try {
        cluResult = await recognizeCLU(userInput);
        topIntent = cluResult.prediction.topIntent;
        entities = cluResult.prediction.entities;
      } catch (err) {
        console.error("CLU error:", err.message);
      }

      const prompt = `
You are a smart travel assistant. Help the user based on their intent and entities.
User Intent: ${topIntent}
Image Description: ${imageDescription || 'No image uploaded'}
Entities: ${JSON.stringify(entities)}
Message: "${userInput}"
      `;

      let gptReply;
      try {
        history.push({ role: "user", content: prompt });
        gptReply = await generateGPTResponse(history);
        history.push({ role: "assistant", content: gptReply });
        
        await context.sendActivity(gptReply);
        
      } catch (err) {
        console.error("GPT Error:", err.message);
        await context.sendActivity("⚠️ Could not generate a smart reply.");
      }

      await next();
      await this.historyAccessor.set(context, history);
      await this.conversationState.saveChanges(context);
    });

    this.onMembersAdded(async (context, next) => {
      for (const member of context.activity.membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity("👋 Welcome to Deakin Travel Assistant! Ask me about your next trip.");
        }
      }
      await next();
    });
  }

  async runDirectMessage(text, serviceUrl = 'http://localhost:3978') {
    await this.adapter.continueConversation(
      {
        conversation: { id: 'conv1' },
        channelId: 'directline',
        serviceUrl: serviceUrl  // Use the passed serviceUrl
      },
      async (turnContext) => {
        // Create activity
        turnContext.activity = {
          type: 'message',
          text: text,
          from: { id: 'user1', name: 'User' },
          recipient: { id: 'bot', name: 'Bot' },
          conversation: { id: 'conv1' },
          channelId: 'directline',
          serviceUrl: serviceUrl  // Also set it here
        };
  
        await this.run(turnContext);
      }
    );
  }
  
}
/**
 * Formats a list of items into a numbered Markdown list for Telegram
 * @param {Array<string>} items - List of places/hotels/activities
 * @returns {string} - Formatted Markdown text
 */
function escapeForTelegramMarkdownV2(text) {
    return text
        .replace(/\\/g, '\\\\')  // Double escape backslashes first
        .replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1'); // Then escape everything else
}

async function downloadAttachment(contentUrl, token) {
    const response = await fetch(contentUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  
    if (!response.ok) {
      throw new Error('Failed to download attachment');
    }
  
    const arrayBuffer = await response.arrayBuffer(); // Correct for fetch v3+
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
}

module.exports.WanderMateBot = WanderMateBot;