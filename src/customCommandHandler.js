import { createParser } from './parser';

const parseSpecificVariableType = (type, regex) => (token) => {
    const matchResult = regex.exec(token);
    if (matchResult && matchResult.length === 2) return {
        type,
        name: matchResult[1]
    };
}

const wordSymbol = Symbol('word');
const wordVariableRegex = /\{word\:(.*)\}/g;
const wordVariableParser = parseSpecificVariableType(wordSymbol, wordVariableRegex);
const userSymbol = Symbol('user');
const userVariableRegex = /\{user\:(.*)\}/g;
const userVariableParser = parseSpecificVariableType(userSymbol, userVariableRegex);
const messageSymbol = Symbol('message');
const messageVariableRegex = /\{message\:(.*)\}/g;
const messageVariableParser = parseSpecificVariableType(messageSymbol, messageVariableRegex);

const commandNameParser = (token, wordIndex, words) => token[0] === "!" ? token.slice(1) : undefined;

const variableParser = (token, wordIndex, words) => {
    const wordResult = wordVariableParser(token);
    if (wordResult) return wordResult;

    const userResult = userVariableParser(token);
    if (userResult) return userResult;

    const messageResult = messageVariableParser(token);
    return messageResult;
}

const pipeParser = (token, wordIndex, words) => token === "|" ? true : undefined

const customCommandParser = createParser({
    tokenParser: commandNameParser,
    resultName: 'commandName'
}, {
    tokenParser: variableParser,
    optional: true,
    repeating: true,
    resultName: 'tokens'
}, {
    tokenParser: pipeParser
});

const customCommandAction = (context, words) => {
    const { bot, commandBot } = context;
    try {
        const parsedCustomCommand = customCommandParser(words);
        const validity = checkValidity(parsedCustomCommand);
        if (!validity.valid) {
            bot.sendMessage({
                to: context.channelId,
                message: validity.error
            });
            return;
        }
        commandBot.addCommandHandler({
            commandName: parsedCustomCommand.commandName.toLowerCase(),
            commandAction: (newContext, newWords) => {
                const { channelId } = newContext;
                const invalidTokens = parsedCustomCommand.tokens.map((token, tokenIndex) => {
                    if (token.type === userSymbol) {
                        const username = newWords[tokenIndex];
                        if (!userExists(username, bot)) {
                            return {
                                valid: false,
                                error: `Expected user at position ${tokenIndex} but instead got ${username}`
                            }
                        }
                    }
                    return {
                        valid: true
                    }
                }).filter(validity => !validity.valid);
                if (invalidTokens.length > 0) {
                    bot.sendMessage({
                        to: channelId,
                        message: invalidTokens[0].error
                    });
                    return;
                }
                const variables = parsedCustomCommand.tokens.map((token, tokenIndex) => {
                    return {
                        name: token.name,
                        value: token.type === messageSymbol ? newWords.slice(tokenIndex).join(' ') : newWords[tokenIndex]
                    }
                });
                const message = parsedCustomCommand.rest.map(word => {
                    return variables
                        .reduce((currentWords, variable) => currentWords.replace(new RegExp(`{${variable.name}}`, 'g'), variable.value), word)
                        .replace(/\\{/g, "{").replace(/\\}/g, "}");
                }).join(' ');
                bot.sendMessage({
                    to: channelId,
                    message
                });
            }
        });
        bot.sendMessage({
            to: context.channelId,
            message: `Custom command !${parsedCustomCommand.commandName} was successfully created.`
        })
    }
    catch(e) {
        bot.sendMessage({
            to: context.channelId,
            message: `Error creating custom command: ${e.stack}`
        });
    }
}

const isVariable = word => word.startsWith("{") && word.endsWith("}");

const checkValidity = parsedCustomCommand => {
    if (!parsedCustomCommand.success) {
        return {
            valid: false,
            error: `Error creating custom command: ${parsedCustomCommand.error}`
        }
    }
    if (parsedCustomCommand.tokens) {
        for (let i = 0; i < parsedCustomCommand.tokens.length - 1; i++) {
            const token = parsedCustomCommand.tokens[i];
            if (token.type === messageSymbol) {
                return {
                    valid: false,
                    error: `Message variable must be last variable.`
                }
            }
        }

        const names = parsedCustomCommand.tokens.map(token => token.name);
        if ((new Set(names)).size !== names.length) {
            return {
                valid: false,
                error: `Each variable name must be unique.`
            }
        }
    }
    
    for (let i = 0; i < parsedCustomCommand.rest.length; i++) {
        const word = parsedCustomCommand.rest[i];
        if (isVariable(word)) {
            const variableName = word.substring(1, word.length - 1);
            const variable = parsedCustomCommand.tokens.find(token => token.name === variableName);
            if (!variable) {
                return {
                    valid: false,
                    error: `Unknown variable ${variableName} in template.`
                }
            }
        }
    }
    return {
        valid: true
    }
}

const userExists = (possibleUser, bot) => {
    const userId = possibleUser.substring(2, possibleUser.length - 1);
    return bot.users[userId] != undefined;
}

export const customCommandHandler = {
    commandName: 'create',
    commandAction: customCommandAction,
    description: 'Creates a custom command.  Syntax is as follows:\n!create !commandname <variables> | <message>\n'
}