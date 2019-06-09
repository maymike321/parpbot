const discord = require('discord.io');

export class CommandBot {
    constructor(authToken) {
        this.bot = new discord.Client({
            token: authToken
        });
        this.commandHandlerMap = [];
        this.addCommandHandler = (commandName, commandHandler) => this.commandHandlerMap.push({commandName, commandHandler});
        this.getUsername = userId => {
            const user = this.bot.users[userId];
            return user ? user.username : undefined;
        }
        this.sendMessage = this.bot.sendMessage.bind(this.bot);
        this.run = () => {
            this.bot.on('message', (user, userId, channelId, message, event) => {
                const messageContext = {user, userId, channelId, message, event, commandBot: this};
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