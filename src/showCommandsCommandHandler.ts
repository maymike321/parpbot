import { CommandAction, CommandHandler } from "./commandBot";

const showCommandsAction: CommandAction = (message, words, commandBot) => {
    if (words.length !== 0) return;
    const messageBeginning = `\`Available commands: \n\n`;
    const messageEnd = commandBot.commandHandlers
        .filter(commandHandler => commandHandler.requiredPermissions.every(permission => message.member.hasPermission(permission)))
        .map(commandHandler => {
            const prefix = commandHandler.custom ? 'Custom command.  ' : '';
            return `!${commandHandler.commandName}: ${prefix}${commandHandler.description ? `${commandHandler.description}` : ''}`
        }).join('\n');
    message.channel.send(`${messageBeginning}${messageEnd}\``);
}

export const showCommandsCommandHandler: CommandHandler = {commandName: 'commands', commandAction: showCommandsAction, description: 'Shows available commands.'};