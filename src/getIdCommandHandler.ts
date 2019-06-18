import { CommandAction, CommandHandler } from "./commandBot";

const getIdCommandAction: CommandAction = (context, words) => {
    const { userId, channelId, bot } = context;
    if (words.length === 0) {
        bot.sendMessage({
            to: channelId,
            message: `Your user id is ${userId}`
        });
        return;
    }
    const possibleUser = words[0];
    if (words.length !== 1 || (!possibleUser.startsWith("<@") || !possibleUser.endsWith(">"))) {
        bot.sendMessage({
            to: channelId,
            message: `Usage:  !getId @user`
        });
        return;
    }
    bot.sendMessage({
        to: channelId,
        message: `${possibleUser}'s user id is: ${possibleUser.substring(2, possibleUser.length - 1)}`
    });
}

export const getIdCommandHandler: CommandHandler = {
    commandName: 'getid',
    commandAction: getIdCommandAction,
    description: 'Gets the id of a given user.'
}