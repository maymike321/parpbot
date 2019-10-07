import { CommandAction, CommandHandler } from "./commandBot";

const getIdCommandAction: CommandAction = (message, words) => {
    if (words.length === 0) {
        message.channel.send(`Your user id is ${message.author.id}`);
        return;
    }
    const possibleUser = words[0];
    if (words.length !== 1 || (!possibleUser.startsWith("<@") || !possibleUser.endsWith(">"))) {
        message.channel.send(`Usage:  !getId @user`);
        return;
    }
    message.channel.send(`${possibleUser}'s user id is: ${possibleUser.substring(2, possibleUser.length - 1)}`);
}

export const getIdCommandHandler: CommandHandler = {
    commandName: 'getid',
    commandAction: getIdCommandAction,
    description: 'Gets the id of a given user.'
}