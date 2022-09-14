
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

const play: iCommand = {
    name: 'play',
    description: 'Inicia reprodução de audio do youtube',
    group: Groups.music,
    aliases: ['p'],
    permission: [],
    cooldown: undefined,
    active: true,
    async execute(message: Message, music: string[]): Promise<void> {
        try {
            if (!message.member!.voice.channel) throw new CommandsCallError(message, 'Você não está em um canal de voz');
            const VoiceChannel = message.member?.voice.channel;
            const url = await YouTube.searchOne(music.toString());

            try {
                const queue = new SongQueue({
                    message: message,
                    connection: joinVoiceChannel({
                        channelId: VoiceChannel!.id,
                        guildId: message.guild!.id,
                        adapterCreator: message.guild!.voiceAdapterCreator,
                    })
                })
            } catch (error) {
                console.error(error);
            }

            

            player.play(resource);

        } catch (error) {
            if (error instanceof CommandsCallError) error.sendResponse();
            if (error instanceof CommandsInternalError) error.logError();
            console.log(error);
        }
    }
}
export default play;