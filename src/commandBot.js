const discord = require('discord.io');

export class CommandBot {
    constructor(authToken) {
        this.bot = new discord.Client({
            token: authToken
        });
        this.commandHandlers = [];
        this.addCommandHandler = ({commandName, commandAction, description}) => {
            if (this.commandHandlers.some(command => command.commandName == commandName)) throw Error(`Command ${commandName} already registered!`);
            this.commandHandlers.push({commandName, commandAction, description});
        };
        this.run = () => {
            this.bot.on('message', (user, userId, channelId, message, event) => {
                const messageContext = {user, userId, channelId, message, event, commands: this.commandHandlers, bot: this.bot};
                if (message.substring(0, 1) === "!") {
                    const tokenizedMessage = message.split(' ');
                    const givenCommandName = tokenizedMessage[0].substring(1).toLowerCase();
                    this.commandHandlers.forEach(command => {
                        const { commandName, commandHandler } = command;
                        if (commandName === givenCommandName) {
                            commandHandler(messageContext, tokenizedMessage.slice(1));
                        }
                    });
                }
            });
            this.bot.connect();
        }

        this.addCommandHandler(showCommandsHandler);
    }
}

const showCommandsHandler = {commandName: 'commands', commandAction: showCommandsAction, description: 'Shows available commands.'};
const showCommandsAction = (context, words) => {
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