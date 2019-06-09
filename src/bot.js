import { CommandBot } from './commandBot.js';
import { remindCommandHandler } from './remindCommandHandler.js';
import { token } from './auth.json';

const commandBot = new CommandBot(token);
commandBot.addCommandHandler('remind', remindCommandHandler);
commandBot.run();