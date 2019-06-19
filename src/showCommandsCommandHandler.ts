import { CommandAction, CommandHandler } from "./commandBot";

const showCommandsAction: CommandAction = (context, words) => {
    if (words.length !== 0) return;
    const { channelId, commandBot } = context;
    const messageBeginning = `\`Available commands: \n\n`;
    const messageEnd = commandBot.commandHandlers.map(commandHandler => {
        const prefix = commandHandler.custom ? 'Custom command.  ' : '';
        return `!${commandHandler.commandName}: ${prefix}${commandHandler.description ? `${commandHandler.description}` : ''}`
    }).join('\n');
    commandBot.sendMessage({
        to: channelId,
        message: `${messageBeginning}${messageEnd}\``
    });
}

export const showCommandsCommandHandler: CommandHandler = {commandName: 'commands', commandAction: showCommandsAction, description: 'Shows available commands.'};