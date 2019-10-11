import { remindCommandHandler } from "../src/remindCommandHandler";
import { Message } from "discord.js";
import { CommandBot } from "../src/commandBot";

describe('Remind command handler', () => {
    const alwaysFailingSend = (s: string) => fail(`Expected not to send message but instead sent ${s}`);
    test('Improper remind command sends no messages', async (done) => {
        const message = {
            author: {
                id: 3,
                send: alwaysFailingSend
            },
            channel: {
                send: alwaysFailingSend
            }
        };
        const commandBot = { fetchUser: async (id: number) => message.author}
        const words = ['invalid', 'message'];
        await remindCommandHandler.commandAction((message as unknown as Message), words, (commandBot as unknown as CommandBot));
        done();
    })
});