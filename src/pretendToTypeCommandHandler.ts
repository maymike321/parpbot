import { CommandAction, CommandHandler } from "./commandBot";

const pretendToTypeCommandAction: CommandAction = (message, words, commandBot) => {
    if (words.length !== 0) return;
    message.channel.startTyping();
    setTimeout(() => message.channel.stopTyping(), 10000);
}

export const pretendToTypeCommandHandler: CommandHandler = {
    commandName: 'pretendtotype',
    commandAction: pretendToTypeCommandAction,
    description: `Causes the bot to pretend to type.`
}