import { AudioPlayer, AudioPlayerState, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { iQueueArgs } from "@src/interfaces/iQueueArgs";
import { Message, TextChannel, User } from 'discord.js';
import ytdl from "ytdl-core-discord";
import { bot } from '@src/index';
import { YouTube } from "youtube-sr";
import { ytVideoPattern } from "@src/providers/patternRegex";

export class MusicQueue {
    public readonly message: Message;
    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;

    public songs: Song[] = [];
    public textChannel: TextChannel;

    constructor(option: iQueueArgs) {
        // Object.assign(this, option);
        this.message = option.message;
        this.connection = option.connection;
        this.textChannel = option.message.channel as TextChannel;

        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        });

        const subscription = this.connection.subscribe(this.player);
        if (!subscription) return;

        this.player.on('stateChange', async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
            if (oldState.status !== AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Idle) {
                this.songs.shift();
                if (this.songs.length) this.processQueue();
            } else if (oldState.status === AudioPlayerStatus.Buffering && newState.status === AudioPlayerStatus.Playing) {
                this.sendPlayingMessage(newState);
            }

        });

        this.player.on("error", (error) => {
            console.log(error);
            this.songs.shift();
            this.processQueue();
        });
    }

    public enqueue(...song: Song[]): void {
        this.songs = this.songs.concat(song);
        this.processQueue();
    }

    public async processQueue(): Promise<void> {
        if (this.player.state.status !== AudioPlayerStatus.Idle) {
            return;
        }

        if (!this.songs.length) {
            this.songs = [];
            this.player.stop();
            this.connection.destroy();
        }

        const next = this.songs[0];

        try {
            const resource = await next.makeResource();
            if (!resource) throw new Error('Resource null');

            this.player.play(resource);
        } catch (error) {
            console.error(error);
            return this.processQueue();
        }
    }

    public async sendPlayingMessage(newState: any): Promise<void> {
        const song = (newState.resource as AudioResource<Song>).metadata;

        let playingMessage: Message;

        try {
            playingMessage = await this.textChannel.send(`Playing: ${song.title} - ${song.url}`);

            await playingMessage.react("⏭");
            await playingMessage.react("⏯");
            await playingMessage.react("🔀");
            await playingMessage.react("⏹");
        } catch (error: any) {
            console.error(error);
            this.textChannel.send(error.message);
            return;
        }

        const filter = (reaction: any, user: User) => user.id !== this.textChannel.client.user!.id;

        const collector = playingMessage.createReactionCollector({
            filter,
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });

        collector.on("collect", async (reaction, user) => {
            if (!this.songs) return;

            const member = await playingMessage.guild!.members.fetch(user);

            switch (reaction.emoji.name) {
                case "⏭":
                    reaction.users.remove(user).catch(console.error);
                    await bot.commands.get("skip")!.execute(this.message);
                    break;

                case "⏯":
                    reaction.users.remove(user).catch(console.error);
                    if (this.player.state.status == AudioPlayerStatus.Playing) {
                        await bot.commands.get("pause")!.execute(this.message);
                    } else {
                        await bot.commands.get("resume")!.execute(this.message);
                    }
                    break;
                case "🔀":
                    reaction.users.remove(user).catch(console.error);
                    await bot.commands.get("shuffle")!.execute(this.message);
                    break;

                case "⏹":
                    reaction.users.remove(user).catch(console.error);
                    await bot.commands.get("stop")!.execute(this.message);
                    collector.stop();
                    break;

                default:
                    reaction.users.remove(user).catch(console.error);
                    break;
            }
        })
    }
}

export class Song {
    public readonly url: string;
    public readonly title: string;
    public readonly duration: number;

    public constructor({ url, title, duration }: SongData) {
        this.url = url;
        this.title = title;
        this.duration = duration;
    }

    public static async from(url: string = "", search: string = "") {
        const isYoutubeUrl = ytVideoPattern.test(url);

        let songInfo;

        if (isYoutubeUrl) {
            songInfo = await ytdl.getInfo(url);

            return new this({
                url: songInfo.videoDetails.video_url,
                title: songInfo.videoDetails.title,
                duration: parseInt(songInfo.videoDetails.lengthSeconds)
            });
        } else {
            const result = await YouTube.searchOne(search);

            songInfo = await ytdl.getInfo(`https://youtube.com/watch?v=${result.id}`);

            return new this({
                url: songInfo.videoDetails.video_url,
                title: songInfo.videoDetails.title,
                duration: parseInt(songInfo.videoDetails.lengthSeconds)
            });
        }
    }

    public async makeResource(): Promise<AudioResource<Song> | void> {
        let stream;

        let type = this.url.includes("youtube.com") ? StreamType.Opus : StreamType.OggOpus;

        const source = this.url.includes("youtube") ? "youtube" : "soundcloud";

        if (source === "youtube") {
            stream = await ytdl(this.url, { quality: "highestaudio", highWaterMark: 1 << 25 });
        }

        if (!stream) return;

        return createAudioResource(stream, { metadata: this, inputType: type, inlineVolume: true });
    }
}

type SongData = {
    url: string;
    title: string;
    duration: number;
}