import { iCommand } from "@src/interfaces/iCommand";
import { Message } from 'discord.js';
import { createPoll } from '@src/providers/embedProvider';
import { Groups } from "@src/providers/groups";

const poll: iCommand = {
    name: 'poll',
    description: 'Inicia uma votação',
    group: Groups.general,
    aliases: [],
    permission: [],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        if (!args.length) {
            message.reply('❌  **|  É necessário passar argumentos para a votação**');
            return;
        }
        if (args.length < 2) {
            message.reply('❌  **|  Tem que passar dois argumentos pra ser uma votação ze buceta**');
            return;
        }
        if (args.length > 9) {
            message.reply('❌  **|  Apenas 10 itens por votação **');
            return;
        }

        createPoll(message, args);
    },
}

export default poll;