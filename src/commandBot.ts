import discord from 'discord.io';
import { showCommandsCommandHandler } from './showCommandsCommandHandler';


export class CommandBot {
    bot: discord.Client;
    commandHandlers: any[];
    addCommandHandler: (commandHandler: any) => void;
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