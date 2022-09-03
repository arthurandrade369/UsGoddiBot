import { iCommand } from "@src/interfaces/iCommand";
import { Message, ButtonStyle, GuildMember, EmbedBuilder, Collection, ComponentType } from 'discord.js';
import { CommandsProvider } from '@src/providers/commandsProvider';
import { iEmbedReturn } from "@src/interfaces/iEmbedReturn";

type PollResult = {
    yes: number,
    no: number
}

type EmbedFields = {
    fieldTitle: string,
    fieldDesc: string
}

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
        const memberToKick = CommandsProvider.getMembersById(guild, args).shift();
        if (!memberToKick) return;
        if(!memberToKick.kickable){
            message.reply('❌  **|  Esse usuário não pode ser kickado pow**');
            return;
        }

        const embedMessage = CommandsProvider.createPollYesNo(message, args, memberToKick);
        embedMessage.embed.addFields({
            name: `${memberToKick.user.username}#${memberToKick.user.discriminator} merece ser kickado?`,
            value: 'Vote com os botões abaixo'
        })
        const response = await message.reply({ embeds: [embedMessage.embed], components: [embedMessage.row] });

        const voted = new Collection<string, string>
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10000 });

        collector.on('collect', interacted => {
            voted.set(interacted.user.id, interacted.customId);
            interacted.reply({ content: `Você votou ${interacted.customId}`, ephemeral: true });

            setTimeout(() => {
                collector.stop('timed out')
            }, 10000);
        });
        collector.on('end', () => {
            voted.forEach((vote) => {
                switch (vote) {
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
            if (poll.yes > poll.no) {
                memberToKick.kick('Popular poll');
            }
            updateEmbed(response, embedMessage, memberToKick, poll);
        })
    },
}

export default votekick;

async function updateEmbed(message: Message, embedMessage: iEmbedReturn, memberToKick: GuildMember, poll: PollResult): Promise<void> {
    const memberDiscriminator = `${memberToKick.user.username}#${memberToKick.user.discriminator}`;
    const embed = CommandsProvider.getEmbed(message, 'Votação Finalizada');
    embed.data.footer = undefined;
    if (poll.yes > poll.no) pollFinishedEmbed({embed: embed, row: embedMessage.row}, poll, { fieldTitle: `O réu, ${memberDiscriminator}, declarado culpado`, fieldDesc: 'Não tankou e foi de base' });
    else pollFinishedEmbed({embed: embed, row: embedMessage.row}, poll, { fieldTitle: `O réu, ${memberDiscriminator}, foi absolvido`, fieldDesc: 'Lili cantou' });

    message.edit({ embeds: [embed], components: [embedMessage.row] });
}

function pollFinishedEmbed(embedMessage: iEmbedReturn, poll: PollResult, reply: EmbedFields): iEmbedReturn {
    embedMessage.embed.addFields({
        name: reply.fieldTitle,
        value: reply.fieldDesc
    })
    embedMessage.embed.addFields({
        name: `**Sim:** ${poll.yes}`,
        value: `${getPerCent(poll.yes, (poll.yes + poll.no))}%`
    })
    embedMessage.embed.addFields({
        name: `**Não:** ${poll.no}`,
        value: `${getPerCent(poll.no, (poll.yes + poll.no))}%`
    })

    embedMessage.row.components.forEach(button => {
        button.setDisabled(true);
        button.setStyle(ButtonStyle.Secondary);
    })

    return embedMessage;
}

function getPerCent(value: number, total: number): string {
    const percent = (value / total) * 100;

    if (percent.toString() !== 'NaN') return percent.toFixed(1);

    return '0';
}