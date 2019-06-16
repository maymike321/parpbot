const deleteCommandAction = (context, words) => {
    const { channelId, bot, commandBot } = context;
    if (words.length !== 1) return;
    const commandNameToDelete = words[0].substring(1).toLowerCase();
    const matchingCommandHandlers = commandBot.commandHandlers
        .find(commandHandler => commandHandler.commandName === commandNameToDelete);
    if (matchingCommandHandlers === undefined) {
        bot.sendMessage({
            to: channelId,
            message: `Command !${commandNameToDelete} does not exist.`
        });
        return;
    }
    if (!matchingCommandHandlers[0].custom) {
        bot.sendMessage({
            to: channelId,
            message: `Delete can only be used to delete custom commands.`
        });
        return;
    }
    commandBot.commandHandlers = commandBot.commandHandlers.filter(commandHandler => commandHandler.commandName !== commandNameToDelete);
    bot.sendMessage({
        to: channelId,
        message: `Command !${commandNameToDelete} successfully deleted.`
    });
}

export const deleteCommandHandler = {
    commandName: 'delete',
    commandAction: deleteCommandAction,
    description: 'Deletes a custom command.  Example: !delete !yell would delete the custom command !yell.'
}