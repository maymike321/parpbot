import { createParser, Parser } from './parser';
import moment from 'moment';
import { CommandAction, CommandHandler } from './commandBot';

const userIdParser: Parser = (token, wordIndex, words) => {
    if (token[1] === "@") return token.substring(2, token.length - 1);
    return;
}

const numberParser: Parser = (token, wordIndex, words) => {
    if (isNaN(token as any)) return;
    return parseInt(token);
}

const seconds = 'seconds';
const minutes = 'minutes';
const hours = 'hours';
const days = 'days';
const weeks = 'weeks';
const months = 'months';
const years = 'years';

const unitParser: Parser = (token, wordIndex, words) => {
    switch (token) {
        case 's':
        case 'sec':
        case 'second':
        case 'seconds':
            return seconds;
        case 'min':
        case 'mins':
        case 'minute':
        case 'minutes':
            return minutes;
        case 'h':
        case 'hr':
        case 'hour':
        case 'hours':
            return hours;
        case 'd':
        case 'day':
        case 'days':
            return days;
        case 'w':
        case 'wk':
        case 'week':
        case 'weeks':
            return weeks;
        case 'mon':
        case 'month':
        case 'months':
            return months;
        case 'y':
        case 'yr':
        case 'year':
        case 'years':
            return years;
        default:
            return; 
    }
}

const remindCommandParser = createParser({
    tokenParser: userIdParser,
    optional: true,
    resultName: 'userId'
}, {
    tokenParser: numberParser,
    resultName: 'timeNumber'
}, {
    tokenParser: unitParser,
    resultName: 'timeUnit'
});

const remindCommandAction: CommandAction = async (message, words, commandBot) => {
    const { author: {id} } = message;
    const remindCommand = remindCommandParser(words);
    if (!remindCommand.success) return;
    const userToRemind = remindCommand.userId ? await commandBot.fetchUser(remindCommand.userId) : message.author;
    const timeUnit = remindCommand.timeNumber === 1 ? remindCommand.timeUnit.substring(0, remindCommand.timeUnit.length - 1) : remindCommand.timeUnit;
    const reminder = remindCommand.rest.join(' ');
    message.channel.send(`Reminding ${userToRemind} "${reminder}" in ${remindCommand.timeNumber} ${timeUnit}`);
    setTimeout(() => {
        const messageBeginning = userToRemind.id !== id ?
        `${id} has sent you a reminder: ` :
        `Reminder: `;
        userToRemind.send(`${messageBeginning}${reminder}`);
    }, moment().add(remindCommand.timeNumber, timeUnit).diff(moment(), 'milliseconds'));
}

export const remindCommandHandler: CommandHandler = {
    commandName: 'remind',
    commandAction: remindCommandAction,
    description: 'Sets a reminder for yourself.  Example:  \'!remind 1 hour Pick up the kids from school\' will tell the bot to remind you in 1 hour to pick up your kids from school.'
};