import {
    VoiceConnection,
    AudioPlayer,
    createAudioPlayer,
    NoSubscriberBehavior,
    AudioPlayerStatus,
    AudioResource
} from '@discordjs/voice';
import { Message, TextChannel } from 'discord.js';
import { iQueueArgs } from '../interfaces/iQueueArgs';
import { Song } from '@src/model/Song';
import { bot } from '../index';
import config from '@src/utils/config';

export class SongQueue {
    public readonly message: Message;
    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;
    public readonly textChannel: TextChannel;

    public resource: AudioResource;
    public songs: Song[];
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

        this.connection.on("stateChange", async (oldState, newState) => { })
        this.player.on("stateChange", async () => { })
        this.connection.on("error", async () => { })
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

    private async sendPlayingEmbed() {

    }

}