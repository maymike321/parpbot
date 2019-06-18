import discord from 'discord.io';
import { showCommandsCommandHandler } from './showCommandsCommandHandler';

export type CommandHandler = {
    commandName: string,
    commandAction: CommandAction,
    description: string,
    custom?: boolean
}

export type CommandAction = (context: Context, words: string[]) => void;

export type Context = {
    user: string,
    userId: string,
    channelId: string,
    message: string,
    event: any,
    bot: discord.Client,
    commandBot: CommandBot
}

export class CommandBot {
    bot: discord.Client;
    commandHandlers: CommandHandler[];
    addCommandHandler: (commandHandler: CommandHandler) => void;
    run: () => void;
    constructor(authToken: string) {
        this.bot = new discord.Client({
            token: authToken
        });
        this.commandHandlers = [];
        this.addCommandHandler = (commandHandler) => {
            if (this.commandHandlers.some(command => command.commandName === commandHandler.commandName)) throw Error(`Command ${commandHandler.commandName} already registered!`);
            this.commandHandlers.push(commandHandler);
        };
        this.run = () => {
            this.bot.on('message', (user, userId, channelId, message, event) => {
                const messageContext = {
                    user,
                    userId,
                    channelId,
                    message,
                    event,
                    bot: this.bot,
                    commandBot: this};
                if (message.substring(0, 1) === "!") {
                    const tokenizedMessage = message.split(' ');
                    const givenCommandName = tokenizedMessage[0].substring(1).toLowerCase();
                    this.commandHandlers.forEach(commandHandler => {
                        const { commandName, commandAction } = commandHandler;
                        if (commandName.toLowerCase() === givenCommandName) {
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