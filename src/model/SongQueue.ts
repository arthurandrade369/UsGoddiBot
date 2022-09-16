import {
    VoiceConnection,
    AudioPlayer,
    createAudioPlayer,
    NoSubscriberBehavior,
    AudioPlayerStatus,
    AudioResource,
    VoiceConnectionStatus,
    VoiceConnectionDisconnectReason,
    entersState,
    AudioPlayerState,
    AudioPlayerPlayingState
} from '@discordjs/voice';
import { Message, TextChannel } from 'discord.js';
import { iQueueArgs } from '../interfaces/iQueueArgs';
import { Song } from '@src/model/Song';
import { bot } from '../index';
import config from '@src/utils/config';
import { promisify } from 'util';

const wait = promisify(setTimeout);

export class SongQueue {
    public readonly message: Message;
    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;
    public readonly textChannel: TextChannel;

    public resource?: AudioResource;
    public songs: Song[] = [];
    public loop = false;
    public waitTimeout: NodeJS.Timeout | undefined;

    constructor(options: iQueueArgs) {
        this.message = options.message;
        this.connection = options.connection;

        this.textChannel = this.message.channel as TextChannel;
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        });
        this.connection.subscribe(this.player);

        this.connection.on("stateChange", async (oldState, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
                if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                    try {
                        this.stop();
                    } catch (error) {
                        console.log(error);
                        this.stop();
                    }
                } else if (this.connection.rejoinAttempts < 5) {
                    await wait((this.connection.rejoinAttempts + 1) * 5000);
                    this.connection.rejoin();
                } else {
                    this.connection.destroy();
                }
            } else if ((newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)) {
                try {
                    await entersState(this.connection, VoiceConnectionStatus.Ready, 20000);
                } catch (error) {
                    if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
                        try {
                            this.connection.destroy();
                        } catch (error) { }
                    }
                }
            }
        });

        this.player.on("stateChange", async (oldState, newState) => {
            if (oldState.status !== AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Idle) {

                if (this.loop && this.songs.length) {
                    const loopedSong = this.songs.shift();
                    if (!loopedSong) return;
                    this.songs.push(loopedSong);
                } else {
                    this.songs.shift();
                }

                if (this.songs.length || this.resource) this.processQueue();
            } else if (oldState.status === AudioPlayerStatus.Buffering && newState.status === AudioPlayerStatus.Playing) {
                this.sendPlayingEmbed(newState);
            }
        });

        this.connection.on("error", async (error) => {
            console.error(error);
            if (this.loop && this.songs.length) {
                const loopedSong = this.songs.shift();
                if (!loopedSong) return;
                this.songs.push(loopedSong);
            } else {
                this.songs.shift();
            }

            this.processQueue();
        })
    }

    public stop(): void {
        this.loop = false;
        this.songs = [];
        this.player.stop();

        this.waitTimeout = setTimeout(() => {
            this.connection.destroy();
            bot.queue.delete(this.message.guild!.id)
            this.textChannel.send("Queue reached the end, leaving channel");
        }, config.voice.STAY_TIME * 60000)
    }

    public enqueue(...songs: Song[]) {
        if (typeof this.waitTimeout !== "undefined") clearTimeout(this.waitTimeout);

        this.songs = this.songs.concat(songs);
        this.processQueue();
    }

    public async processQueue(): Promise<void> {
        if (this.player.state.status !== AudioPlayerStatus.Idle) return;

        if (!this.songs.length) return this.stop();

        const next = this.songs[0];

        try {
            const resource = await next.makeResource();
            if (!resource) return;

            this.resource = resource;
            this.player.play(this.resource);
        } catch (error) {
            console.error(error);

            return this.processQueue();
        }
    }

    private async sendPlayingEmbed(newState: AudioPlayerPlayingState): Promise<void> {
        const song = (newState.resource as AudioResource<Song>).metadata;

        let playingMessage: Message;

        try {
            playingMessage = await this.textChannel.send({ embeds: [song.embedMessage()] });

            
        } catch (error) {

        }
    }

}