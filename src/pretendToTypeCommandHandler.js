export const pretendToTypeCommandHandler = {
    commandName: 'pretendtotype',
    commandAction: pretendToTypeCommandAction,
    description: `Causes the bot to pretend to type.`
}

const pretendToTypeCommandAction = (context, words) => {
    if (words.length !== 0) return;
    const { bot, channelId } = context;
    bot.simulateTyping(channelId);
}