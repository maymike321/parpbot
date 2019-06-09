const discord = require('discord.io');

export class CommandBot {
    constructor(authToken) {
        this.bot = new discord.Client({
            token: authToken
        });
        this.commands = [];
        this.addCommand = (commandName, commandHandler, description) => {
            if (this.commands.some(command => command.commandName == commandName)) throw Error(`Command ${commandName} already registered!`);
            this.commands.push({commandName, commandHandler, description});
        };
        this.run = () => {
            this.bot.on('message', (user, userId, channelId, message, event) => {
                const messageContext = {user, userId, channelId, message, event, commands: this.commands, bot: this.bot};
                if (message.substring(0, 1) === "!") {
                    const tokenizedMessage = message.split(' ');
                    const givenCommandName = tokenizedMessage[0].substring(1);
                    this.commands.forEach(command => {
                        const { commandName, commandHandler } = command;
                        if (commandName === givenCommandName) {
                            commandHandler(messageContext, tokenizedMessage.slice(1));
                        }
                    });
                }
            });
            this.bot.connect();
        }

        this.addCommand('commands', showCommandsHandler, `Shows available commands.`);
    }
}

const showCommandsHandler = (context, words) => {
    if (words.length !== 0) return;
    const { channelId, commands, bot } = context;
    const messageBeginning = `Available commands: \n\n`;
    const messageEnd = commands.map(command => {
        return `!${command.commandName}${command.description ? `: ${command.description}` : ''}`
    }).join('\n\n');
    bot.sendMessage({
        to: channelId,
        message: `${messageBeginning}${messageEnd}`
    });
}