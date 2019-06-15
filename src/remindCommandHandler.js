import { createParser } from './parser';
import moment from 'moment';

const userIdParser = (token, wordIndex, words) => {
    if (token[1] === "@") return token.substring(2, token.length - 1);
    return;
}

const numberParser = (token, wordIndex, words) => {
    if (isNaN(token)) return;
    return parseInt(token);
}

const seconds = 'seconds';
const minutes = 'minutes';
const hours = 'hours';
const days = 'days';
const weeks = 'weeks';
const months = 'months';
const years = 'years';

const unitParser = (token, wordIndex, words) => {
    switch (token) {
        case 's':
        case 'sec':
        case 'second':
        case 'seconds':
            return seconds;
        case 'min':
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

const remindCommandAction = (context, words) => {
    const { userId, channelId, bot } = context;
    const remindCommand = remindCommandParser(words);
    if (!remindCommand.success) return;
    const userToRemind = remindCommand.userId ? remindCommand.userId : userId;
    const timeUnit = remindCommand.timeNumber === 1 ? remindCommand.timeUnit.substring(0, remindCommand.timeUnit.length - 1) : remindCommand.timeUnit;
    const reminder = remindCommand.rest.join(' ');
    bot.sendMessage({
        to: channelId,
        message: `Reminding <@${userToRemind}> "${reminder}" in ${remindCommand.timeNumber} ${timeUnit}`
    });
    setTimeout(() => {
        const messageBeginning = userToRemind !== userId ?
        `<@${userId}> has sent you a reminder: ` :
        `Reminder: `;
            bot.sendMessage({
                to: userToRemind,
                message: `${messageBeginning}${reminder}`
            });
    }, moment().add(remindCommand.timeNumber, timeUnit).diff(moment(), 'miliseconds'));
}

export const remindCommandHandler = {
    commandName: 'remind',
    commandAction: remindCommandAction,
    description: 'Sets a reminder for yourself.  Example:  \'!remind 1 hour Pick up the kids from school\' will tell the bot to remind you in 1 hour to pick up your kids from school.'
};