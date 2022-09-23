
import { joinVoiceChannel } from '@discordjs/voice';
import { iCommand } from "@src/interfaces/iCommand";
import { CommandsCallError, CommandsInternalError } from "@src/model/CommandsError";
import { Groups } from "@src/providers/groups";
import { Message } from 'discord.js';
import { SongQueue } from '../../model/SongQueue';
import { bot } from '@src/index';
import { Song } from '@src/model/Song';
import { CommandsProvider } from '@src/providers/commandsProvider';
import { join } from 'path';

const play: iCommand = {
    name: 'play',
    description: 'Reproduz audio no canal de voz. Tente: `!play Dragonborn`',
    group: Groups.music,
    aliases: ['p'],
    permission: [],
    cooldown: undefined,
    active: true,
    async execute(message: Message, music: string[]): Promise<Message<boolean> | void> {
        try {
            const VoiceChannel = message.member?.voice.channel;
            if (!VoiceChannel) throw new CommandsCallError(message, 'Você não está em um canal de voz');

            const queue = bot.queue.get(message.guild!.id);
            if (queue && VoiceChannel.id !== queue.connection.joinConfig.channelId) {
                return message.reply('Você precisa estar no mesmo canal que o Bot').catch(console.error);
            }
            if (!music.length) return message.reply('Tente !help music').catch(console.error);

            const url = music.toString();
            let song;

            try {
                song = await Song.songFrom(url, music.join(" "));
            } catch (error) {
                console.error(error);
            }
            if (!song) throw new CommandsInternalError('Musica nao encontrada');

            const queuedEmbed = CommandsProvider.getEmbed(message, `Adicionado ${song.title} a queue`);

            if (queue) {
                queue.enqueue(song);

                return message.reply({ embeds: [queuedEmbed] });
            }

            const newQueue = new SongQueue({
                message: message,
                connection: joinVoiceChannel({
                    channelId: VoiceChannel.id,
                    guildId: message.guild!.id,
                    adapterCreator: message.guild!.voiceAdapterCreator,
                })
            })

            bot.queue.set(message.guild!.id, newQueue);

            newQueue.enqueue(song);
        } catch (error) {
            if (error instanceof CommandsCallError) error.sendResponse();
            if (error instanceof CommandsInternalError) error.logError();
        }
    }
}
export default play;