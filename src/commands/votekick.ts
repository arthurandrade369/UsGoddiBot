import { iCommand } from "@src/interfaces/iCommand";
import { ActionRowBuilder, Message, ButtonBuilder, ButtonStyle, InteractionCollector } from 'discord.js';
import { CommandsProvider } from '@src/providers/commandsProvider';
import { bot } from '@src/index';

const votekick: iCommand = {
    name: 'votekick',
    description: 'Inicia uma votação para expulsar alguem do servidor',
    detailedDescription: 'Inicia uma votação, durante 30 seg qualquer um pode votar para expulsar alguem do servidor',
    aliases: ['vk'],
    permission: ['everyone'],
    cooldown: 30000,
    async execute(message: Message, args: string[]): Promise<void> {
        if (!args.length) {
            message.reply('❌  **|  É necessário passar um usuário como target**');
            return;
        }
        const guild = message.guild;
        if (!guild?.available) return;
        const memberToKick = CommandsProvider.getMembersById(guild, args);

        CommandsProvider.createPollYesNo(message, args);

    },
}

export default votekick;