import { VoiceConnection, AudioPlayer, createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';
import { Message, TextChannel } from 'discord.js';
import { iQueueArgs } from '../interfaces/iQueueArgs';

export class SongQueue {
    public readonly message: Message;
    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;
    public readonly textChannel: TextChannel;

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
    }

}