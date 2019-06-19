import { CommandAction, CommandHandler } from "./commandBot";

const getIdCommandAction: CommandAction = (context, words) => {
    const { userId, channelId, commandBot } = context;
    if (words.length === 0) {
        commandBot.sendMessage({
            to: channelId,
            message: `Your user id is ${userId}`
        });
        return;
    }
    const possibleUser = words[0];
    if (words.length !== 1 || (!possibleUser.startsWith("<@") || !possibleUser.endsWith(">"))) {
        commandBot.sendMessage({
            to: channelId,
            message: `Usage:  !getId @user`
        });
        return;
    }
    commandBot.sendMessage({
        to: channelId,
        message: `${possibleUser}'s user id is: ${possibleUser.substring(2, possibleUser.length - 1)}`
    });
}

export const getIdCommandHandler: CommandHandler = {
    commandName: 'getid',
    commandAction: getIdCommandAction,
    description: 'Gets the id of a given user.'
}