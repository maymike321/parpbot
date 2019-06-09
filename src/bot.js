import { CommandBot } from './commandBot.js';
import { remindCommandHandler } from './remindCommandHandler.js';
import { token } from './auth.json';

const commandBot = new CommandBot(token);
commandBot.addCommand('remind', remindCommandHandler, 'Sets a reminder for yourself.  Example:  \'!remind 1 hour Pick up the kids from school\' will tell the bot to remind you in 1 hour to pick up your kids from school.');
commandBot.run();