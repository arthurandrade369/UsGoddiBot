import { iCommand } from "@src/interfaces/iCommand";
import { Message, InteractionCollector, ButtonStyle, GuildMember } from 'discord.js';
import { CommandsProvider } from '@src/providers/commandsProvider';
import { bot } from '@src/index';
import { iEmbedReturn } from "@src/interfaces/iEmbedReturn";

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
        const poll = { yes: 0, no: 0 };
        const guild = message.guild;
        if (!guild?.available) return;
        const memberToKick = CommandsProvider.getMembersById(guild, args);
        if (!memberToKick[0]) return;

        const embedMessage = CommandsProvider.createPollYesNo(message, args, memberToKick[0]);
        embedMessage.embed.addFields({
            name: `${memberToKick[0].displayName} merece ser kickado?`,
            value: 'Vote com os botões abaixo'
        })
        const response = await message.reply({ embeds: [embedMessage.embed], components: [embedMessage.row] });

        const interaction = new InteractionCollector(bot.client);

        interaction.on('collect', interected => {
            switch (interected.customId) {
                case 'Sim':
                    poll.yes += 1;
                    break;
                case 'Não':
                    poll.no += 1;
                    break;
                default:
                    break;
            }
        })
        updateEmbed(response, embedMessage, memberToKick);

    },
}

export default votekick;

async function updateEmbed(message: Message, embedMessage: iEmbedReturn, memberToKick: (GuildMember | null)[]): Promise<void> {
    await new Promise(wait => setTimeout(wait, 5000));

    const embed = CommandsProvider.getEmbed(message, 'Votação Finalizada');
    embed.data.footer = undefined;
    // embed.addFields({
    //     name: `${memberToKick[0]?.displayName} não mereceu ser kickado`,
    //     value: 'Foi triste ze'
    // })
    // embed.addFields({
    //     name: `**Sim:** ${poll.yes}`,
    //     value: '10%'
    // })
    // embed.addFields({
    //     name: `**Não:** ${poll.no}`,
    //     value: '90%'
    // })

    const row = embedMessage.row;

    row.components.forEach(button => {
        button.setDisabled(true);
        button.setStyle(ButtonStyle.Secondary);
    })

    message.edit({ embeds: [embed], components: [row] });
}