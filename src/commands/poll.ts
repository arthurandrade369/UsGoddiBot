import { iCommand } from "@src/interfaces/iCommand";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector, Message } from 'discord.js';
import { CommandsProvider } from '@src/providers/commandsProvider';
import { bot } from '@src/index';

const poll: iCommand = {
    name: 'poll',
    description: 'Inicia uma votação com os argumentos passados',
    aliases: [],
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
        const embed = CommandsProvider.getEmbed();
        embed.setTitle('Votação iniciada');
        embed.setDescription('Clique em um icone para votar');
        const row = new ActionRowBuilder<ButtonBuilder>();


        args.forEach((option) => {
            const button = CommandsProvider.createButtonComponent(option, ButtonStyle.Secondary);
            row.addComponents(button);
        })

        await message.reply({ embeds: [embed], components: [row] }).catch(console.error);

        const interaction = new InteractionCollector(bot.client);

        interaction.on('collect', interected => {
            interected.reply(`<@${interected.user.id}> clicked on the ${interected.customId} button`);
            console.log(interected.message)
        })
    },
}

export default poll;