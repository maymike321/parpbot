import { CommandBot } from './commandBot';
import { showCommandsCommandHandler } from './showCommandsCommandHandler'
import { remindCommandHandler } from './remindCommandHandler';
import { pretendToTypeCommandHandler } from './pretendToTypeCommandHandler';
import { customCommandHandler } from './customCommandHandler';
import { deleteCommandHandler } from './deleteCommandHandler';
import { getIdCommandHandler } from './getIdCommandHandler';

const commandBot = new CommandBot(process.argv[2]);
commandBot.addCommandHandler(showCommandsCommandHandler);
commandBot.addCommandHandler(remindCommandHandler);
commandBot.addCommandHandler(pretendToTypeCommandHandler);
commandBot.addCommandHandler(customCommandHandler);
commandBot.addCommandHandler(deleteCommandHandler);
commandBot.addCommandHandler(getIdCommandHandler);
commandBot.addCommandHandler({
    commandName: 'test',
    commandAction: (message, words, commandBot) => {
        message.channel.send(JSON.stringify(message.guild.members));
    },
    description: 'testing'})
commandBot.run();