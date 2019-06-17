import { CommandBot } from './commandBot.js';
import { remindCommandHandler } from './remindCommandHandler.js';
import { pretendToTypeCommandHandler } from './pretendToTypeCommandHandler.js';
import { customCommandHandler } from './customCommandHandler.js';
import { deleteCommandHandler } from './deleteCommandHandler.js';

const commandBot = new CommandBot(process.argv[2]);
commandBot.addCommandHandler(remindCommandHandler);
commandBot.addCommandHandler(pretendToTypeCommandHandler);
commandBot.addCommandHandler(customCommandHandler);
commandBot.addCommandHandler(deleteCommandHandler);
commandBot.run();