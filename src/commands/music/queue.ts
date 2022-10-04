import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { getEmbed } from "@src/providers/embedProvider";
import { Emojis } from "@src/providers/emojis";
import { Groups } from "@src/providers/groups";
import { SongsProvider } from "@src/providers/songsProvider";
import { Message, EmbedBuilder } from 'discord.js';
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

        const embedQueue = await message.reply({
            content: `**Pagina atual - ${currentPage + 1}/${embeds.length}**`,
            embeds: [embeds[currentPage]]
        });

        embedQueue.createMessageComponentCollector();
    },
}

export default queue;

function getEmbedQueueMessage(message: Message, queue: SongQueue): EmbedBuilder[] {
    let embedQueue: EmbedBuilder[] = [];
    let songPagination = 10;
    let playlistDuration = 0;
    const songsProvider = new SongsProvider();

    for (let actualSongs = 1; actualSongs <= queue.songs.length; actualSongs += 10) {
        queue.songs.forEach((track) => { playlistDuration += parseInt(track.duration); })
        const currentSong = queue.songs.slice(actualSongs, songPagination);
        let nextSongs = actualSongs;
        songPagination += 10;

        const info = currentSong.map((track) => { return track });

        const embed = getEmbed(message, `${Emojis.Music.queue} Queue de Reprodução`,
            `**Música atual - [${queue.songs[0].title}](${queue.songs[0].url})**`)
            .setThumbnail(queue.songs[0].thumb)
            .setTimestamp();

        info.forEach((track) => {
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