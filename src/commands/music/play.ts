
import {
    createAudioPlayer,
    joinVoiceChannel,
    NoSubscriberBehavior,
    createAudioResource,
    StreamType
} from '@discordjs/voice';
import { iCommand } from "@src/interfaces/iCommand";
import { CommandsCallError, CommandsInternalError } from "@src/model/CommandsError";
import { Groups } from "@src/providers/groups";
import { ytVideoPattern } from "@src/providers/patternRegex";
import { Message } from 'discord.js';
import { Video, YouTube } from "youtube-sr";
import ytdl from 'ytdl-core-discord';
import { videoInfo } from 'ytdl-core'
import { iSongData } from '@src/interfaces/iSongData';
import { SongQueue } from '../../model/SongQueue';
import { bot } from '@src/index';

const play: iCommand = {
    name: 'play',
    description: 'Inicia reprodução de audio do youtube',
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
            try {
                const newQueue = new SongQueue({
                    message: message,
                    connection: joinVoiceChannel({
                        channelId: VoiceChannel.id,
                        guildId: message.guild!.id,
                        adapterCreator: message.guild!.voiceAdapterCreator,
                    })
                })
            } catch (error) {
                console.error(error);
            }

        } catch (error) {
            if (error instanceof CommandsCallError) error.sendResponse();
            if (error instanceof CommandsInternalError) error.logError();
            console.log(error);
        }
    }
}
export default play;