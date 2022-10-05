import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { CommandsCallError, CommandsInternalError } from "@src/model/CommandsError";
import { SongQueue } from "@src/model/SongQueue";
import { Groups } from "@src/providers/groups";
import { SongsProvider } from "@src/providers/songsProvider";
import { Message } from "discord.js";
import { Playlist } from '../../model/Playlist';

const playlist: iCommand = {
    name: 'playlist',
    description: 'Adiciona uma playlist inteira à queue. Tente \`!playlist https://youtube.com/playlist?list=PLBB13F295B0C02A30\`',
    group: Groups.music,
    aliases: ['pl'],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, musics: string[]): Promise<Message | void> {
        try {
            const songProvider = new SongsProvider();
            const voiceChannel = message.member?.voice.channel;
            if (!voiceChannel) throw new CommandsCallError(message, 'Você não está em um canal de voz');

            const queue = bot.queue.get(message.guild!.id);
            if (queue && voiceChannel.id !== queue.connection.joinConfig.channelId) {
                return message.reply('Você precisa estar no mesmo canal que o Bot').catch(console.error);
            }

            const playlist = await Playlist.from(musics.toString(), musics.join(''), message.member);

            if (queue) {
                queue.songs.push(...playlist.videos);

                const queuedEmbed = songProvider.getPlaylistEmbedMessage(message, playlist);
                return message.reply({ embeds: [queuedEmbed] });
            }

            const newQueue = new SongQueue({
                message: message,
                connection: joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guildId,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
                })
            }, voiceChannel);

            bot.queue.set(message.guild!.id, newQueue);
            newQueue.enqueue(...playlist.videos);

            const queuedEmbed = songProvider.getPlaylistEmbedMessage(message, playlist);
            return message.reply({ embeds: [queuedEmbed] });
        } catch (error) {
            if (error instanceof CommandsCallError) error.sendResponse();
            if (error instanceof CommandsInternalError) error.logError();
        }
    },
}

export default playlist;