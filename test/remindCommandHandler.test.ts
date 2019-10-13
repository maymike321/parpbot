import { remindCommandHandler } from "../src/remindCommandHandler";
import { Message } from "discord.js";
import { CommandBot } from "../src/commandBot";
import { convert } from "./test-utilities";
const moment = require("moment").default || require("moment")

describe('Remind command handler', () => {
    jest.useFakeTimers();
    let users: any[];
    let usersSentTo: any[];
    let channelsSentTo: any[];
    const alwaysFailingSend = (s: string) => fail(`Expected not to send message but instead sent ${s}`);
    const userSentSpyCreator = (u) => (s: string) => { usersSentTo.push(u) }
    const channelSentSpyCreator = (c) => (s: string) => { channelsSentTo.push(c) }
    const commandBot = { fetchUser:  async (id: number) => users.find(user => user.id == id) };
    let userOne;
    let userTwo;
    let alwaysFailingUser;
    let channelOne;
    let channelTwo;
    let alwaysFailingChannel;
    beforeEach(() => {
        users = [
            userOne,
            userTwo,
            alwaysFailingUser
        ]
        usersSentTo = [];
        channelsSentTo = [];
        userOne = { id: 1, send: userSentSpyCreator(userOne) };
        userTwo = { id: 2, send: userSentSpyCreator(userTwo) };
        alwaysFailingUser = { id: 3, send: alwaysFailingSend };
        channelOne = { id: 1, send: channelSentSpyCreator(channelOne) };
        channelTwo = { id: 2, send: channelSentSpyCreator(channelTwo) };
        alwaysFailingChannel = { id: 3, send: alwaysFailingSend };
    });

    test('Improper remind command sends no messages', async (done) => {
        const message = {
            author: userOne,
            channel: alwaysFailingChannel
        };
        const words = ['invalid', 'message'];
        await remindCommandHandler.commandAction(convert<Message>(message), words, convert<CommandBot>(commandBot));
        done();
    });

    test('Reminder message is sent in chat', async (done) => {
        const message = {
            author: userOne,
            channel: channelOne
        };
        const words = ['0', 'sec', 'hello'];
        await remindCommandHandler.commandAction(convert<Message>(message), words, convert<CommandBot>(commandBot));
        jest.runAllTimers();
        expect(channelsSentTo[0].id).toBe(channelOne.id);
        done();
    });

    test('Message with no user specified sends to self', async (done) => {
        const message = {
            author: userOne,
            channel: channelOne
        };
        const words = ['0', 'sec', 'hello'];
        await remindCommandHandler.commandAction(convert<Message>(message), words, convert<CommandBot>(commandBot));
        jest.runAllTimers();
        expect(usersSentTo[0].id).toBe(userOne.id);
        done();
    });

    test('Message with user specified sends to specified user', async (done) => {
        const message = {
            author: userOne,
            channel: channelOne
        };
        const words = [`<@${userTwo.id}>`, '0', 'sec', 'hello'];
        await remindCommandHandler.commandAction(convert<Message>(message), words, convert<CommandBot>(commandBot));
        jest.runAllTimers();
        expect(usersSentTo[0].id).toBe(userTwo.id);
        done();
    })

    const abbreviationsToUnitOfTimeMap = [
        {
            abbreviations: ['s', 'sec', 'second', 'seconds'],
            unitOfTime: 'seconds'
        },
        {
            abbreviations: ['min', 'mins', 'minute', 'minutes'],
            unitOfTime: 'minutes'
        },
        {
            abbreviations: ['h', 'hr', 'hour', 'hours'],
            unitOfTime: 'hours'
        },
        {
            abbreviations: ['d', 'day', 'days'],
            unitOfTime: 'days'
        },
        {
            abbreviations: ['w', 'wk', 'week', 'weeks'],
            unitOfTime: 'weeks'
        }
    ];
    abbreviationsToUnitOfTimeMap.forEach(({abbreviations, unitOfTime}) => {
        abbreviations.forEach(abbreviation => {
            test(`Abbreviation ${abbreviation} is properly parsed`, async (done) => {
                const message = {
                    author: userOne,
                    channel: channelOne
                };
                const words = ['2', abbreviation, 'hello'];
                await remindCommandHandler.commandAction(convert<Message>(message), words, convert<CommandBot>(commandBot));
                jest.advanceTimersByTime(moment().add(1, unitOfTime).diff(moment(), 'milliseconds'));
                expect(usersSentTo.length).toBe(0);
                jest.advanceTimersByTime(moment().add(2, unitOfTime).diff(moment(), 'milliseconds'));
                expect(usersSentTo[0].id).toBe(userOne.id);
                done();
            });
        });
    });
});