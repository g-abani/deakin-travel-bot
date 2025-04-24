const restify = require('restify');
const { BotFrameworkAdapter } = require('botbuilder');
const { WanderMateBot } = require('./bot');
require('dotenv').config();

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Catch-all for errors
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    await context.sendActivity('Oops. Something went wrong!');
};

// Create bot instance
const bot = new WanderMateBot();

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.PORT || 3978, () => {
    console.log(`🤖 Bot is running at http://localhost:${server.address().port}`);
});

// Listen for incoming requests
server.post('/api/messages', async (req, res) => {
    await adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});
