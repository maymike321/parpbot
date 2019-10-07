import { CommandAction, CommandHandler } from "./commandBot";

const deleteCommandAction: CommandAction = (message, words, commandBot) => {
    const commandNameToDelete = words[0].toLowerCase();
    const matchingCommandHandler = commandBot.commandHandlers
        .find(commandHandler => commandHandler.commandName === commandNameToDelete);
    if (matchingCommandHandler === undefined) {
        message.channel.send(`Command !${commandNameToDelete} does not exist.`);
        return;
    }
    if (!matchingCommandHandler.custom) {
        message.channel.send(`Delete can only be used to delete custom commands.`);
        return;
    }
    commandBot.commandHandlers = commandBot.commandHandlers.filter(commandHandler => commandHandler.commandName !== commandNameToDelete);
    message.channel.send(`Command !${commandNameToDelete} successfully deleted.`);
}

export const deleteCommandHandler: CommandHandler = {
    commandName: 'delete',
    commandAction: deleteCommandAction,
    description: 'Deletes a custom command.  Example: !delete yell would delete the custom command yell.',
    requiredPermissions: ['ADMINISTRATOR']
}