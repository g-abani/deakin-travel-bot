// utils/sendFormattedMessage.js

function sanitizeMarkdown(text) {
    // Escape characters that can break Telegram Markdown
    return text.replace(/([_*[\]()~`>#+=|{}.!\\])/g, '\\$1');
  }
  
  function sanitizeHTML(text) {
    // Strip unsafe tags (Telegram only supports a subset)
    return text.replace(/<[^bisuacodeprehref][^>]*>/g, '');
  }
  
  /**
   * Sends a formatted message to Telegram (or plain text for other channels)
   * @param {TurnContext} context
   * @param {string} message - The message to send
   * @param {'markdown' | 'html'} format - Desired format (markdown or html)
   */
  async function sendFormattedMessage(context, message, format = 'markdown') {
    const channel = context.activity.channelId;
    const supportedFormats = ['markdown', 'html'];
    let safeText = message;
    let textFormat = 'plain';
  
    if (channel === 'telegram' && supportedFormats.includes(format)) {
      if (format === 'markdown') {
        safeText = sanitizeMarkdown(message);
        textFormat = 'markdown';
      } else if (format === 'html') {
        safeText = sanitizeHTML(message);
        textFormat = 'xml'; // 'xml' = HTML for Bot Framework
      }
    }
  
    await context.sendActivity({
      text: safeText,
      textFormat
    });
  }
  
  module.exports = { sendFormattedMessage };
  