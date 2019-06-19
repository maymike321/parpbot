import { CommandAction, CommandHandler } from "./commandBot";

const pretendToTypeCommandAction: CommandAction = (context, words) => {
    if (words.length !== 0) return;
    const { channelId, commandBot } = context;
    commandBot.simulateTyping(channelId);
}

export const pretendToTypeCommandHandler: CommandHandler = {
    commandName: 'pretendtotype',
    commandAction: pretendToTypeCommandAction,
    description: `Causes the bot to pretend to type.`
}