import { Song } from "@src/model/Song";
import { EmbedBuilder, Message } from "discord.js";
import { bot } from '@src/index';
import { Playlist } from '@src/model/Playlist';
import { Video } from "youtube-sr";
import config from '@src/utils/config';

export class SongsProvider {
    getSongEmbedMessage(message: Message, song: Song, discriminator: string): EmbedBuilder {
        const playingEmbed = new EmbedBuilder();
        switch (discriminator) {
            case 'PLAYING':
                playingEmbed.setAuthor({
                    name: 'TOCANDO',
                    iconURL: `${message.author.avatarURL()}`
                });

                playingEmbed.addFields({ name: 'Pedido por:', value: `<@${message.author.id}>`, inline: true });
                playingEmbed.addFields({ name: 'Musica por:', value: `\`${song.artist}\``, inline: true });
                playingEmbed.addFields({ name: 'Duração:', value: `\`>${this.getDuration(song.duration)}\``, inline: true });
                break;

            case 'QUEUE':
                playingEmbed.setAuthor({
                    name: 'ADICIONADO A QUEUE',
                    iconURL: `${message.author.avatarURL()}`
                });

                playingEmbed.addFields({ name: 'Pedido por:', value: `<@${message.author.id}>`, inline: true });
                playingEmbed.addFields({ name: 'Duração:', value: `\`>${this.getDuration(song.duration)}\``, inline: true });
                playingEmbed.addFields({ name: 'Posição na queue:', value: `\`${this.getQueuePosition(song, message)}\``, inline: true });
                break;

            default:
                break;
        }

        playingEmbed.setTitle(song.title);
        playingEmbed.setURL(song.url);
        playingEmbed.setThumbnail(song.thumb);

        return playingEmbed;
    }

    getPlaylistEmbedMessage(message: Message, playlist: Playlist): EmbedBuilder {
        const playlistEmbed = new EmbedBuilder();
        playlistEmbed.setAuthor({
            name: 'ADICIONADO A QUEUE',
            iconURL: `${message.author.avatarURL()}`
        });

        playlistEmbed.addFields({ name: 'Pedido por:', value: `<@${message.author.id}>`, inline: true });
        playlistEmbed.addFields({ name: 'Tracks Adicionadas:', value: `${playlist.data.videoCount}`, inline: true });

        if (!playlist.data.title) throw new Error('Play');
        if (!playlist.data.url) throw new Error('Error');
        if (!playlist.data.thumbnail) throw new Error('Error');
        if (!playlist.data.thumbnail.url) throw new Error('Error');
        playlistEmbed.setTitle(playlist.data.title);
        playlistEmbed.setURL(playlist.data.url);
        playlistEmbed.setThumbnail(playlist.data.thumbnail.url);

        return playlistEmbed;
    }

    getSearchSongEmbedMessage(message: Message, videos: Video[]) {
        const searchEmbed = new EmbedBuilder();
        searchEmbed.setAuthor({
            name: 'Escolha uma ou mais entre as musicas abaixo',
            iconURL: config.bot.iconUrl,
        });

        videos.forEach((video, index) => {
            if (!video.title) return;
            searchEmbed.addFields({
                name: `${index} -- ${video.title} - [${this.getDuration(video.duration.toString())}]`,
                value: `${video.dislikes}`
            })
        })

    }

    getDuration(duration: string): string {
        let minutes: number;
        let seconds: number;


        minutes = Math.floor(parseInt(duration) / 60);
        seconds = parseInt(duration) - minutes * 60;

        return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    getQueuePosition(song: Song, message: Message): number {
        return bot.queue.get(message.guild!.id)!.songs.indexOf(song) + 1;
    }
}