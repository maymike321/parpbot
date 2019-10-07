import { TextChannel, DMChannel, GroupDMChannel }  from 'discord.js';
import { createParser, Parser } from './parser';
import { CommandAction, CommandHandler } from './commandBot';

type Token = {
    type: Symbol,
    name: string
}

const parseSpecificVariableType: (type: Symbol, regex: RegExp) => (token: string) => Token
    = (type: Symbol, regex: RegExp) => (token: string) => {
        const matchResult = token.match(regex);
        if (matchResult && matchResult.length === 2) return {
                    type,
                    name: matchResult[1]
                };
            }

const wordSymbol = Symbol('word');
const wordVariableRegex = /\{word\:(.*)\}/;
const wordVariableParser = parseSpecificVariableType(wordSymbol, wordVariableRegex);
const userSymbol = Symbol('user');
const userVariableRegex = /\{user\:(.*)\}/;
const userVariableParser = parseSpecificVariableType(userSymbol, userVariableRegex);
const messageSymbol = Symbol('message');
const messageVariableRegex = /\{message\:(.*)\}/;
const messageVariableParser = parseSpecificVariableType(messageSymbol, messageVariableRegex);

const commandNameParser: Parser = (token, wordIndex, words) => token[0] === "!" ? token.slice(1) : undefined;

const variableParser: Parser = (token, wordIndex, words) => {
    const wordResult = wordVariableParser(token);
    if (wordResult) return wordResult;

    const userResult = userVariableParser(token);
    if (userResult) return userResult;

    const messageResult = messageVariableParser(token);
    return messageResult;
}

const pipeParser: Parser = (token, wordIndex, words) => token === "|" ? true : undefined

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

const customCommandAction: CommandAction = (message, words, commandBot) => {
    try {
        const parsedCustomCommand = customCommandParser(words);
        const validity = checkValidityOfCustomCommand(parsedCustomCommand);
        if (!validity.valid) {
            message.channel.send(validity.error);
            return;
        }
        const tokens = parsedCustomCommand.tokens as Token[] || [];
        commandBot.addCommandHandler({
            commandName: parsedCustomCommand.commandName.toLowerCase(),
            commandAction: (newMessage, newWords) => {
                const validityOfExecutedCommand = checkValidityOfExecutedCustomCommand(tokens, newWords, words, newMessage.channel);
                if (!validityOfExecutedCommand.valid) {
                    newMessage.channel.send(validityOfExecutedCommand.error);
                    return;
                }
                const variables = tokens.map((token, tokenIndex) => {
                    return {
                        name: token.name,
                        value: token.type === messageSymbol ? newWords.slice(tokenIndex).join(' ') : newWords[tokenIndex]
                    }
                });
                const message = parsedCustomCommand.rest.map((word: string) => {
                    return variables
                        .reduce((currentWords, variable) => currentWords.replace(new RegExp(`{${variable.name}}`, 'g'), variable.value), word)
                        .replace(/\\{/g, "{").replace(/\\}/g, "}");
                }).join(' ');
                newMessage.channel.send(message);
            },
            description: `Template: ${words.slice(1, tokens.length + 1).join(' ') || 'none'}.  Response: ${parsedCustomCommand.rest.join(' ')}`,
            custom: true
        });
        message.channel.send(`Custom command !${parsedCustomCommand.commandName} was successfully created.`);
    }
    catch(e) {
        message.channel.send(`${e}`);
    }
}

const isVariable = (word: string) => word.startsWith("{") && word.endsWith("}");

const checkValidityOfCustomCommand = (parsedCustomCommand: { success: any; error: any; tokens: any[]; rest: any[]; }) => {
    if (!parsedCustomCommand.success) {
        return {
            valid: false,
            error: `Error creating custom command: ${parsedCustomCommand.error}`
        }
    }
    const tokens = parsedCustomCommand.tokens as Token[] || [];
    for (let i = 0; i < tokens.length - 1; i++) {
        const token = parsedCustomCommand.tokens[i];
        if (token.type === messageSymbol) {
            return {
                valid: false,
                error: `Message variable must be last variable.`
            }
        }
    }

    const names = tokens.map(token => token.name);
    if ((new Set(names)).size !== names.length) {
        return {
            valid: false,
            error: `Each variable name must be unique.`
        }
    }
    
    for (let i = 0; i < parsedCustomCommand.rest.length; i++) {
        const word = parsedCustomCommand.rest[i];
        if (isVariable(word)) {
            const variableName = word.substring(1, word.length - 1);
            const variable = tokens.find(token => token.name === variableName);
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

const checkValidityOfExecutedCustomCommand = (tokens: Token[], newWords: string[], words: string[], channel: TextChannel | DMChannel | GroupDMChannel) => {
    if (tokens.length > newWords.length) {
        return {
            valid: false,
            error: `Unable to parse command.  Template:  ${words.slice(1, tokens.length + 1).join(' ')}`
        }
    }
    const invalidTokens = tokens.map((token, tokenIndex) => {
        if (token.type === userSymbol) {
            const username = newWords[tokenIndex];
            if (isUser(username, channel)) {
                return {
                    valid: false,
                    error: `Expected user but instead got ${username}`
                }
            }
        }
        return {
            valid: true
        }
    }).filter(validity => !validity.valid);
    if (invalidTokens.length > 0) {
        return invalidTokens[0];
    }
    return {
        valid: true
    }
}

const isUser = (possibleUser: string, channel: TextChannel | DMChannel | GroupDMChannel) => {
    const userId = possibleUser.substring(2, possibleUser.length - 1);
    return (channel instanceof TextChannel) && (channel as TextChannel).members[userId] !== undefined;
}


export const customCommandHandler: CommandHandler = {
    commandName: 'create',
    commandAction: customCommandAction,
    description: 'Creates a custom command.  Syntax is as follows:\n\t!create !commandname <variables> | <response>\n\tExample:  !create !yell {word:w} {user:u} {message:m} | {p} {u}, {m}! creates a command !yell, which can be used like !yell Hey @para you\'re a nerd, which causes the bot to say \"Hey @para, you\'re a nerd!".\n\tThree types of variables:  word, which is a single word; user, which is a discord user; and message, which is one or more words at the end of the command.',
    requiredPermissions: ['ADMINISTRATOR']
}