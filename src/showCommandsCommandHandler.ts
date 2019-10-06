import { CommandAction, CommandHandler } from "./commandBot";

const showCommandsAction: CommandAction = (message, tokenizedWords, commandBot) => {
    if (tokenizedWords.length !== 0) return;
    const messageBeginning = `\`Available commands: \n\n`;
    const messageEnd = commandBot.commandHandlers.map(commandHandler => {
        const prefix = commandHandler.custom ? 'Custom command.  ' : '';
        return `!${commandHandler.commandName}: ${prefix}${commandHandler.description ? `${commandHandler.description}` : ''}`
    }).join('\n');
    message.channel.send(`${messageBeginning}${messageEnd}\``);
}

export const showCommandsCommandHandler: CommandHandler = {commandName: 'commands', commandAction: showCommandsAction, description: 'Shows available commands.'};