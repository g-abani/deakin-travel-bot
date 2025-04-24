const { ActivityHandler } = require('botbuilder');

class WanderMateBot extends ActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {
            const userInput = context.activity.text;
            console.log(`📩 Message received: ${userInput}`);

            // Echo the user input for now
            await context.sendActivity(`You said: "${userInput}"`);

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('👋 Welcome to WanderMate – your smart travel buddy!');
                }
            }
            await next();
        });
    }
}

module.exports.WanderMateBot = WanderMateBot;
