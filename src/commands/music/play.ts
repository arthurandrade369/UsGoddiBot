
import {
    createAudioPlayer,
    DiscordGatewayAdapterCreator,
    joinVoiceChannel,
    NoSubscriberBehavior,
    createAudioResource,
    StreamType,
    AudioPlayerState,
    AudioPlayerStatus
} from '@discordjs/voice';
import { iCommand } from "@src/interfaces/iCommand";
import { CommandsCallError, CommandsInternalError } from "@src/model/CommandsError";
import { Groups } from "@src/providers/Groups";
import { ytVideoPattern } from "@src/providers/patternRegex";
import { Message } from 'discord.js';
import { Video, YouTube } from "youtube-sr";
import ytdl from 'ytdl-core-discord';
import { videoInfo } from 'ytdl-core'

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

            let song: SongData;
            let songs: SongData[] = [];

            try {
                const isYoutubeUrl = ytVideoPattern.test(url.url);

                let songInfo: videoInfo | Video;

                if (isYoutubeUrl) {
                    songInfo = await ytdl.getInfo(url.url);

                    song = {
                        url: songInfo.videoDetails.video_url,
                        title: songInfo.videoDetails.title,
                        duration: parseInt(songInfo.videoDetails.lengthSeconds)
                    };
                } else {
                    const result = await YouTube.searchOne(music.join(' '));

                    songInfo = await ytdl.getInfo(`https://youtube.com/watch?v=${result.id}`);

                    song = {
                        url: songInfo.videoDetails.video_url,
                        title: songInfo.videoDetails.title,
                        duration: parseInt(songInfo.videoDetails.lengthSeconds)
                    };
                }
            } catch (error) {
                console.error(error);
            }

            const connection = joinVoiceChannel({
                channelId: VoiceChannel!.id,
                guildId: message.guild!.id,
                adapterCreator: message.guild!.voiceAdapterCreator,
            });

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play,
                },
            });

            const subscription = connection.subscribe(player);
            if (!subscription) return;

            player.on('stateChange', async (oldState, newState) => {

            });

            let stream;

            let type = url.url.includes("youtube.com") ? StreamType.Opus : StreamType.OggOpus;

            const source = url.url.includes("youtube") ? "youtube" : "soundcloud";

            if (source === "youtube") {
                stream = await ytdl(url.url, { quality: "highestaudio", highWaterMark: 1 << 25 });
            }

            if (!stream) return;

            const resource = createAudioResource(stream, {
                metadata: { title: 'What a beautiful song' },
                inputType: type,
                inlineVolume: true,
            });

            player.play(resource);

        } catch (error) {
            if (error instanceof CommandsCallError) error.sendResponse();
            if (error instanceof CommandsInternalError) error.logError();
            console.log(error);
        }
    }
}
export default play;

type SongData = {
    url: string;
    title: string;
    duration: number;
}