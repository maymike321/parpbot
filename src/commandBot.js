import discord from 'discord.io';
import { showCommandsCommandHandler } from './showCommandsCommandHandler';

export class CommandBot {
    constructor(authToken) {
        this.bot = new discord.Client({
            token: authToken
        });
        this.commandHandlers = [];
        this.addCommandHandler = (commandHandler) => {
            const { commandName, commandAction, description } = commandHandler;
            if (this.commandHandlers.some(command => command.commandName == commandName)) throw Error(`Command ${commandName} already registered!`);
            this.commandHandlers.push({commandName, commandAction, description});
        };
        this.run = () => {
            this.bot.on('message', (user, userId, channelId, message, event) => {
                const messageContext = {user, userId, channelId, message, event, commandHandlers: this.commandHandlers, bot: this.bot};
                if (message.substring(0, 1) === "!") {
                    const tokenizedMessage = message.split(' ');
                    const givenCommandName = tokenizedMessage[0].substring(1).toLowerCase();
                    this.commandHandlers.forEach(commandHandler => {
                        const { commandName, commandAction } = commandHandler;
                        if (commandName === givenCommandName) {
                            commandAction(messageContext, tokenizedMessage.slice(1));
                        }
                    });
                }
            });
            this.bot.connect();
        }

        this.addCommandHandler(showCommandsCommandHandler);
    }
}