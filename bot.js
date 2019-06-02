const discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const moment = require('moment');

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, { colorize: true });
logger.level = "debug";

let bot = new discord.Client({
    token: auth.token,
    autorun: true
});
bot.on('ready', event => {
    logger.info('Connected');
    logger.info('Logged in as: ' + bot.username + '-(' + bot.id + ')');
});

bot.on('message', (user, userId, channelId, message, event) => {
    if (message.substring(0,1) === "!") {
        const command = message.substring(1);
        handleRemindCommand(user, userId, channelId, event, command);
        handleIdCommand(user, userId, channelId, command);
    }
});

const handleRemindCommand = (user, userId, channelId, event, command) => {
    const remindCommand = tryParseRemindCommand(command, user, userId);
    if (remindCommand !== undefined) {
        if (remindCommand.username === undefined){
            bot.sendMessage({
                to: channelId,
                message: `Unable to send reminder.`
            });
        } else {
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
}

const tryParseRemindCommand = (command, user, userId) => {
    const words = command.split(' ');
    if (words[0].toLowerCase() !== 'remind' || words.length < 3) {
        return undefined;
    }
    let otherUser;
    let firstValue;
    let otherValues;
    if (words[1][1] === "@") {
        otherUser = words[1].substring(2, words[1].length - 1);
        firstValue = words[2].toLowerCase();
        otherValues = words.slice(3);
    }
    else {
        firstValue = words[1].toLowerCase();
        otherValues = words.slice(2);
    }
    let attemptedTimeValue = tryParseTimeValue(firstValue, otherValues);
    if (attemptedTimeValue === undefined) attemptedTimeValue = tryParseTimeValue(firstValue + otherValues[0].toLowerCase(), otherValues.slice(1));  //Try again in the case of a command like !remind 1 hour instead of !remind 1hour
    if (attemptedTimeValue === undefined) return undefined;  //We've done all we can here
    return {
        ...attemptedTimeValue,
        username: otherUser ? getUsername(otherUser) : user,
        userId: otherUser ? otherUser : userId
    };
}

const getUsername = userId => {
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

const handleIdCommand = (user, userId, channelId, command) => {
    if (command === "id") {
        bot.sendMessage({
            to: channelId,
            message: `${user}'s id is ${userId}`
        });
    }
}

const first = (arr, func) => 
{
    for (const val of arr) {
        var retVal = func(val);
        if (retVal !== undefined) return retVal;
    }
    return undefined;
}