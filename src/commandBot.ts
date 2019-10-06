import Discord, { Message } from 'discord.js';

export type CommandHandler = {
    commandName: string,
    commandAction: CommandAction,
    description: string,
    custom?: boolean
}

export type CommandAction = (message: Message, tokenizedContent: string[], commandBot?: CommandBot) => void;

export class CommandBot extends Discord.Client {
    commandHandlers: CommandHandler[];
    addCommandHandler: (commandHandler: CommandHandler) => void;
    run: (login?: boolean) => void;
    prefix: string;
    constructor(authToken: string) {
        super();
        this.prefix = '!';
        this.commandHandlers = [];
        this.addCommandHandler = (commandHandler) => {
            if (this.commandHandlers.some(command => command.commandName === commandHandler.commandName)) throw Error(`Command ${commandHandler.commandName} already registered!`);
            this.commandHandlers.push(commandHandler);
        };
        this.run = (login: boolean = true) => {
            this.on('message', message => {
                const content = message.content;
                if (content.substring(0, 1) === this.prefix) {
                    const tokenizedMessage = content.split(' ');
                    const givenCommandName = tokenizedMessage[0].substring(1).toLowerCase();
                    const properCommandhandler = this.commandHandlers.find(commandHandler => commandHandler.commandName.toLowerCase() === givenCommandName);
                    if (properCommandhandler) properCommandhandler.commandAction(message, tokenizedMessage.slice(1), this);
                }
            });
            if (login) this.login(authToken);
        }
    }
}