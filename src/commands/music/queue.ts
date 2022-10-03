import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { getEmbed } from "@src/providers/embedProvider";
import { Emojis } from "@src/providers/emojis";
import { Groups } from "@src/providers/groups";
import { SongsProvider } from "@src/providers/songsProvider";
import { Message, EmbedBuilder } from 'discord.js';
import { Song } from '../../model/Song';

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
        const embeds = getEmbedQueueMessage(message, queue.songs);

        const embedQueue = await message.reply({
            content: `**Pagina atual - ${currentPage + 1}/${embeds.length}**`,
            embeds: [embeds[currentPage]]
        });
    },
}

export default queue;

function getEmbedQueueMessage(message: Message, songs: Song[]): EmbedBuilder[] {
    let embedQueue: EmbedBuilder[] = [];
    let songPagination = 10;
    let playlistDuration = 0;
    const songsProvider = new SongsProvider();

    for (let actualSongs = 1; actualSongs <= songs.length; actualSongs += 10) {
        songs.forEach((track) => { playlistDuration += parseInt(track.duration); })
        const currentSong = songs.slice(actualSongs, songPagination);
        let nextSongs = actualSongs;
        songPagination += 10;

        const info = currentSong.map((track) => `${++nextSongs} - [${track.title}](${track.url}) [${songsProvider.getDuration(track.duration)}]`)

        const embed = getEmbed(message, `${Emojis.Music.queue} Queue de Reprodução`,
            `**Música atual - [${songs[0].title}](${songs[0].url})**\n\n${info}\n`)
            .setThumbnail(songs[0].thumb)
            .setTimestamp();

        embed.addFields({
            name: `**${Emojis.General.clock} Duração total**`,
            value: `\`${songsProvider.getDuration(playlistDuration.toString())}\``,
            inline: true
        });
        embedQueue.push(embed);
    }

    return embedQueue;
}