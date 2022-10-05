import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { createButtonComponent, getEmbed } from "@src/providers/embedProvider";
import { Emojis } from "@src/providers/emojis";
import { Groups } from "@src/providers/groups";
import { SongsProvider } from "@src/providers/songsProvider";
import { Message, EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, User, ButtonInteraction, CacheType, ComponentType } from 'discord.js';
import { Song } from '../../model/Song';
import { SongQueue } from '../../model/SongQueue';

const queue: iCommand = {
    name: 'queue',
    description: 'Envia informações sobre a queue',
    group: Groups.music,
    aliases: ['q'],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<void> {
        const queue = bot.queue.get(message.guild!.id);
        if (!queue) return;

        let currentPage = 0;
        const embeds = getEmbedQueueMessage(message, queue);
        const buttons = getButtonsQueueMessage();

        const embedQueue = await message.reply({
            content: `**Pagina atual - ${currentPage + 1}/${embeds.length}**`,
            embeds: [embeds[currentPage]],
            components: [buttons],
        });

        const collector = embedQueue.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
        collector.on('collect', (interected) => {
            if (interected.user.id !== message.author.id) {
                interected.reply({
                    ephemeral: true,
                    content: 'Apenas quem requisitou pode alterar a queue',
                })
            };

            switch (interected.customId) {
                case 'previous':
                    if (currentPage > 0) {
                        --currentPage;
                        embedQueue.edit({
                            content: `**Pagina atual - ${currentPage + 1}/${embeds.length}**`,
                            embeds: [embeds[currentPage]],
                        })
                    }
                    interected.deferUpdate()
                    break;

                case 'next':
                    if (currentPage < embeds.length - 1) {
                        ++currentPage;
                        embedQueue.edit({
                            content: `**Pagina atual - ${currentPage + 1}/${embeds.length}**`,
                            embeds: [embeds[currentPage]],
                        })
                    }
                    interected.deferUpdate()
                    break;

                case 'stop':
                    collector.stop();
                    interected.deferUpdate()
                    break;

                default:
                    break;
            }
        });


        embedQueue.createMessageComponentCollector();
    },
}

export default queue;

function getEmbedQueueMessage(message: Message, queue: SongQueue): EmbedBuilder[] {
    let embedQueue: EmbedBuilder[] = [];
    let songPagination = 10;
    const songsProvider = new SongsProvider();
    let playlistDuration = 0;

    queue.songs.forEach((track) => { playlistDuration += parseInt(track.duration); })

    for (let actualSongs = 0; actualSongs <= queue.songs.length; actualSongs += 10) {
        const currentSong = queue.songs.slice(actualSongs, songPagination);
        let nextSongs = actualSongs;
        songPagination += 10;

        const embed = getEmbed(message, `${Emojis.Music.queue} Queue de Reprodução`,
            `**Música atual - [${queue.songs[0].title}](${queue.songs[0].url})**`)
            .setThumbnail(queue.songs[0].thumb)
            .setTimestamp();

        currentSong.forEach((track) => {
            embed.addFields({
                name: `${++nextSongs} - ${track.title} - \`[${songsProvider.getDuration(track.duration)}]\``,
                value: `Pedido por: <@${track.member.id}>`,
            });
        });
        embed.addFields({
            name: `**${Emojis.General.clock} Duração total**`,
            value: `\`${songsProvider.getDuration(playlistDuration.toString())}\``,
            inline: true
        });
        embed.addFields({
            name: `**${Emojis.Music.loop} Loop**`,
            value: `\`${queue.loop ? `${Emojis.General.active} Ativado` : `${Emojis.General.inactive} Desativado`}\``,
            inline: true
        });
        embedQueue.push(embed);
    }

    return embedQueue;
}

function getButtonsQueueMessage(): ActionRowBuilder<ButtonBuilder> {
    const previous = createButtonComponent('previous', ButtonStyle.Primary, Emojis.Queue.previous);
    const next = createButtonComponent('next', ButtonStyle.Primary, Emojis.Queue.next);
    const stop = createButtonComponent('stop', ButtonStyle.Secondary, Emojis.Queue.stop);
    const row = new ActionRowBuilder<ButtonBuilder>;

    row.addComponents(previous, next, stop);

    return row;
}