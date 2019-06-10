const showCommandsAction = (context, words) => {
    if (words.length !== 0) return;
    const { channelId, commandHandlers, bot } = context;
    const messageBeginning = `Available commands: \n\n`;
    const messageEnd = commandHandlers.map(commandHandler => {
        return `!${commandHandler.commandName}${commandHandler.description ? `: ${commandHandler.description}` : ''}`
    }).join('\n');
    bot.sendMessage({
        to: channelId,
        message: `${messageBeginning}${messageEnd}`
    });
}

export const showCommandsCommandHandler = {commandName: 'commands', commandAction: showCommandsAction, description: 'Shows available commands.'};