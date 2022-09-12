import { iCommand } from "@src/interfaces/iCommand";
import { Message, ButtonStyle, GuildMember, Collection, ComponentType, User } from 'discord.js';
import { CommandsProvider } from '@src/providers/commandsProvider';
import { iEmbedReturn } from "@src/interfaces/iEmbedReturn";
import { CommandsCallError, CommandsInternalError } from "@src/model/CommandsError";
import { Groups } from "@src/providers/groups";

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
    description: 'Inicia uma votação, com 30 seg de duração, para expulsar alguem do servidor',
    group: Groups.general,
    args: 'User',
    aliases: ['vk'],
    permission: ['everyone'],
    cooldown: 30000,
    active: true,
    async execute(message: Message, args: string[]): Promise<void> {
        try {
            if (!args.length) throw new CommandsCallError(message, 'É necessário passar um usuário como target')

            const poll = { yes: 0, no: 0 };

            const guild = message.guild;
            if (!guild?.available) throw new CommandsInternalError('Guild unvailable or unexists');

            const memberToKick = CommandsProvider.getMembersById(guild, args).shift();
            if (!memberToKick) throw new CommandsCallError(message, 'Membro não existe');
            if (!memberToKick.kickable) throw new CommandsCallError(message, 'Esse usuário não pode ser kickado')

            const embedMessage = CommandsProvider.createPollYesNo(message,
                [{
                    name: `${memberToKick.user.username}#${memberToKick.user.discriminator} merece ser kickado?`,
                    value: 'Vote com os botões abaixo'
                }]
            );
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
                updateEmbed(response, message.author, embedMessage, memberToKick, poll);
            })
        } catch (error) {
            if (error instanceof CommandsCallError) error.sendResponse();
            if (error instanceof CommandsInternalError) error.logError();
        }
    },
}

export default votekick;

async function updateEmbed(message: Message, originalMessageAuthor: User, embedMessage: iEmbedReturn, memberToKick: GuildMember, poll: PollResult): Promise<void> {
    const memberDiscriminator = `${memberToKick.user.username}#${memberToKick.user.discriminator}`;

    const embed = CommandsProvider.getEmbed(message, 'Votação Finalizada');

    embed.setFooter(
        {
            text: `Requested by : ${originalMessageAuthor.username}#${originalMessageAuthor.discriminator}`,
            iconURL: `${originalMessageAuthor.avatarURL()}`
        });

    if (poll.yes > poll.no) pollFinishedEmbed(
        {
            embed: embed,
            row: embedMessage.row
        },
        poll,
        {
            fieldTitle: `O réu, ${memberDiscriminator}, declarado culpado`, fieldDesc: 'Não tankou e foi de base'
        }
    );
    else pollFinishedEmbed(
        {
            embed: embed,
            row: embedMessage.row
        },
        poll,
        {
            fieldTitle: `O réu, ${memberDiscriminator}, foi absolvido`, fieldDesc: 'Lili cantou'
        }
    );

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