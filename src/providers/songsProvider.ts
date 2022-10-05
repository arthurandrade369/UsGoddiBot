import { Song } from "@src/model/Song";
import { EmbedBuilder, Message } from "discord.js";
import { bot } from '@src/index';
import { Playlist } from '@src/model/Playlist';

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

        playlistEmbed.setTitle(playlist.data.title!);
        playlistEmbed.setURL(playlist.data.url!);
        playlistEmbed.setThumbnail(playlist.data.thumbnail?.url!);

        return playlistEmbed;
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