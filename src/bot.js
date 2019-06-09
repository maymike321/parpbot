import { CommandBot } from './commandBot.js';
import { remindCommandHandler } from './remindCommandHandler.js';
import { token } from './auth.json';
import { pretendToTypeCommandHandler } from './pretendToTypeCommandHandler.js';

const commandBot = new CommandBot(token);
commandBot.addCommandHandler(remindCommandHandler);
commandBot.addCommandHandler(pretendToTypeCommandHandler);
commandBot.run();