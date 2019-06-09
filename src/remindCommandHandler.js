const moment = require('moment');

export const remindCommandHandler = (context, words) => {
    const { user, userId, channelId, bot } = context;
    const remindCommand = tryParseRemindCommand(context, words);
    if (remindCommand === undefined) return;
    if (remindCommand.username === undefined) {
        bot.sendMessage({
            to: channelId,
            message: `Unable to send reminder.`
        });
    }
    else {
        bot.sendMessage({
            to: channelId,
            message: `Reminding ${remindCommand.username} "${remindCommand.message}" in ${remindCommand.timeAmount} ${remindCommand.timeUnit}`
        });
        setTimeout(() => {
            const messageBeginning = remindCommand.username !== user ? 
                `<@${userId}> has sent you a reminder: ` 
                : `Reminder: `;
                bot.sendMessage({
                to: remindCommand.userId,
                message: `${messageBeginning}${remindCommand.message}.`
            });
        }, remindCommand.parsedTime.diff(moment(), 'miliseconds'));
    }
}

const tryParseRemindCommand = (context, words) => {
    const { user, userId, bot } = context;
    let otherUser;
    let firstValue;
    let otherValues;
    if (words[0][1] === "@") {
        otherUser = words[0].substring(2, words[0].length - 1);
        firstValue = words[1].toLowerCase();
        otherValues = words.slice(2);
    }
    else {
        firstValue = words[0].toLowerCase();
        otherValues = words.slice(1);
    }
    let attemptedTimeValue = tryParseTimeValue(firstValue, otherValues);
    if (attemptedTimeValue === undefined) attemptedTimeValue = tryParseTimeValue(firstValue + otherValues[0].toLowerCase(), otherValues.slice(1));  //Try again in the case of a command like !remind 1 hour instead of !remind 1hour
    if (attemptedTimeValue === undefined) return undefined;  //We've done all we can here
    return {
        ...attemptedTimeValue,
        username: otherUser ? getUsername(bot, otherUser) : user,
        userId: otherUser ? otherUser : userId
    };
}

const getUsername = (bot, userId) => {
    const user = bot.users[userId];
    return user ? user.username : undefined;
}

const tryParseTimeValue = (firstValue, otherValues) => {
    const message = otherValues.join(' ');
    if (message === "") return undefined;
    for (const parseFunc of [tryParseSeconds, tryParseMinutes, tryParseHours, tryParseDays, tryParseWeeks, tryParseMonths, tryParseYears]) {
        const val = parseFunc(firstValue);
        if (val !== undefined) return {
            ...val,
            message 
        };
    }
    return undefined;
}

const tryParseSeconds = value => tryParseShorthand(value, 'seconds', ['s', 'sec', 'second', 'seconds']);
const tryParseMinutes = value => tryParseShorthand(value, 'minutes', ['min', 'minute', 'minutes']);
const tryParseHours = value => tryParseShorthand(value, 'hours', ['h', 'hr', 'hour', 'hours']);
const tryParseDays = value => tryParseShorthand(value, 'days', ['d', 'day', 'days']);
const tryParseWeeks = value => tryParseShorthand(value, 'weeks', ['w', 'wk', 'week', 'weeks']);
const tryParseMonths = value => tryParseShorthand(value, 'months', ['mon', 'month', 'months']);
const tryParseYears = value => tryParseShorthand(value, 'years', ['y', 'yr', 'year', 'years']);

const tryParseShorthand = (possibleValue, timeUnit, abbreviations) => 
    first(abbreviations, abbr =>
    {
        const splitValue = possibleValue.split(abbr);
        if (splitValue.length !== 2 || splitValue[1] !== '') return undefined;
        if (isNaN(splitValue[0])) return undefined;
        const parsedNumber = parseInt(splitValue[0]);
        return { 
            parsedTime: moment().add(parsedNumber, timeUnit),
            timeAmount: parsedNumber,
            timeUnit : parsedNumber === 1 ? timeUnit.substring(0, timeUnit.length - 1) : timeUnit
        }
    });

const first = (arr, func) => 
{
    for (const val of arr) {
        var retVal = func(val);
        if (retVal !== undefined) return retVal;
    }
    return undefined;
}