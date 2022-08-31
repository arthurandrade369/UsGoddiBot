import { iCommand } from "@src/interfaces/iCommand";
import { Message } from 'discord.js';
import { CommandsProvider } from '@src/providers/commandsProvider';

const poll: iCommand = {
    name: 'poll',
    description: 'Inicia uma votação',
    detailedDescription: 'Inicia uma votação por certos parametros',
    aliases: [],
    permission: [],
    cooldown: undefined,
    async execute(message: Message, args: string[]): Promise<void> {
        if (!args.length) {
            message.reply('❌  **|  É necessário passar argumentos para a votação**');
            return;
        }
        if (args.length > 9) {
            message.reply('❌  **|  Apenas 10 itens por votação **');
            return;
        }
        
        CommandsProvider.createPoll(message, args);
    },
}

export default poll;