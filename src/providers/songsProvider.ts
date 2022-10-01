import { Song } from "@src/model/Song";
import { EmbedBuilder, Message } from "discord.js";
import { bot } from '@src/index';

export const getSongEmbedMessage = (message: Message, song: Song, discriminator: string): EmbedBuilder => {
    const playingEmbed = new EmbedBuilder();
    switch (discriminator) {
        case 'PLAYING':
            playingEmbed.setAuthor({
                name: 'TOCANDO',
                iconURL: `${message.author.avatarURL()}`
            });

            playingEmbed.addFields({ name: 'Requested by', value: `<@${message.author.id}>`, inline: true });
            playingEmbed.addFields({ name: 'Song by', value: `\`${song.artist}\``, inline: true });
            playingEmbed.addFields({ name: 'Duration', value: `\`>${getDuration(song.duration)}\``, inline: true });
            break;

        case 'QUEUE':
            playingEmbed.setAuthor({
                name: 'ADICIONADO A QUEUE',
                iconURL: `${message.author.avatarURL()}`
            });

            playingEmbed.addFields({ name: 'Requested by', value: `<@${message.author.id}>`, inline: true });
            playingEmbed.addFields({ name: 'Duration', value: `\`>${getDuration(song.duration)}\``, inline: true });
            playingEmbed.addFields({ name: 'Posição na queue', value: `\`${getQueuePosition(song, message)}\``, inline: true });
            break;

        default:
            break;
    }


    playingEmbed.setTitle(song.title);
    playingEmbed.setURL(song.url);
    playingEmbed.setThumbnail(song.thumb);


    return playingEmbed;
}

export const getDuration = (duration: string): string => {
    let formatedDuration = parseInt(duration);
    formatedDuration = (formatedDuration / 100);
    return formatedDuration.toString().replace('.', ':');
}

export const getQueuePosition = (song: Song, message: Message): number => {
    return bot.queue.get(message.guild!.id)!.songs.indexOf(song) + 1;
}