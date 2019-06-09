const discord = require('discord.io');

export class CommandBot {
    constructor(authToken) {
        this.bot = new discord.Client({
            token: authToken
        });
        this.commandHandlerMap = [];
        this.addCommandHandler = (commandName, commandHandler) => this.commandHandlerMap.push({commandName, commandHandler});
        this.run = () => {
            this.bot.on('message', (user, userId, channelId, message, event) => {
                const messageContext = {user, userId, channelId, message, event, bot: this.bot};
                if (message.substring(0, 1) === "!") {
                    const tokenizedMessage = message.split(' ');
                    const givenCommandName = tokenizedMessage[0].substring(1);
                    this.commandHandlerMap.forEach(cmhEntry => {
                        const { commandName, commandHandler } = cmhEntry;
                        if (commandName === givenCommandName) {
                            commandHandler(messageContext, tokenizedMessage.slice(1));
                        }
                    });
                }
            });
            this.bot.connect();
        }
    }
}