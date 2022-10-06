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
    AudioPlayerPlayingState
} from '@discordjs/voice';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    TextChannel,
    ComponentType,
    ButtonInteraction,
    CacheType,
    VoiceBasedChannel,
    GuildMember
} from 'discord.js';
import { iQueueArgs } from '@src/interfaces/iQueueArgs';
import { Song } from '@src/model/Song';
import config from '@src/utils/config';
import { promisify } from 'util';
import { Emojis } from '@src/providers/emojis';
import { bot } from '@src/index';
import { createButtonComponent } from '@src/providers/embedProvider';

const wait = promisify(setTimeout);

export class SongQueue {
    public readonly message: Message;
    public readonly connection: VoiceConnection;
    public readonly player: AudioPlayer;
    public readonly textChannel: TextChannel;
    public readonly bot = bot;

    static voiceChannel: VoiceBasedChannel;
    public resource?: AudioResource;
    public songs: Song[] = [];
    public loop = false;
    public waitTimeout: NodeJS.Timeout | undefined;

    constructor(options: iQueueArgs, voiceChannel: VoiceBasedChannel) {
        this.message = options.message;
        this.connection = options.connection;
        SongQueue.voiceChannel = voiceChannel;

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
                        } catch (error) {
                            console.error(error);
                        }
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
            if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
                this.connection.destroy();
            }
            bot.queue.delete(this.message.guild!.id)
            this.textChannel.send("**Queue chegou ao fim, saindo do canal**");
        }, config.voice.STAY_TIME * 60000)
    }

    public enqueue(...songs: Song[]) {
        if (typeof this.waitTimeout !== "undefined") clearTimeout(this.waitTimeout);

        this.songs = this.songs.concat(songs);
        this.processQueue();
    }

    public async processQueue(): Promise<void> {
        if (this.player.state.status !== AudioPlayerStatus.Idle) return;

        if (!this.songs.length) return;

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

        const buttonsComponent = this.createButtonsComponents();

        const embed = {
            embeds: [song.embedMessage(this.message)],
            components: [buttonsComponent]
        }

        const playingMessage = await this.textChannel.send(embed);

        const filter = (interaction: ButtonInteraction<CacheType>) => interaction.user.id !== this.textChannel.client.user!.id;
        const collector = playingMessage.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: parseInt(song.duration) > 0 ? parseInt(song.duration) * 1000 : 60000
        });

        collector.on('collect', async (interacted) => {
            if (!SongQueue.canModifyQueue(this.message, interacted.member as GuildMember)) {
                interacted.reply({ ephemeral: true, content: '❌  **|Você não está no mesmo canal que o Bot**' });
                return;
            }
            switch (interacted.customId) {
                case 'playpause':
                    if (this.player.state.status === AudioPlayerStatus.Playing) {
                        await this.bot.commands.get("pause")!.execute(this.message);
                        playingMessage.edit({ embeds: embed.embeds, components: [this.modifySendedEmbedByButtonPressed()] });
                        await interacted.deferUpdate();
                    } else {
                        await this.bot.commands.get("resume")!.execute(this.message);
                        playingMessage.edit({ embeds: embed.embeds, components: [this.modifySendedEmbedByButtonPressed()] });
                        await interacted.deferUpdate();
                    }
                    break;

                case 'skip':
                    await this.bot.commands.get("skip")!.execute(this.message);
                    await interacted.deferUpdate();
                    break;

                case 'loop':
                    await this.bot.commands.get("loop")!.execute(this.message);
                    playingMessage.edit({ embeds: embed.embeds, components: [this.modifySendedEmbedByButtonPressed()] });
                    await interacted.deferUpdate();
                    break;

                case 'shuffle':
                    await this.bot.commands.get("shuffle")!.execute(this.message);
                    await interacted.deferUpdate();
                    break;

                case 'stop':
                    await this.bot.commands.get("stop")!.execute(this.message);
                    collector.stop();
                    await interacted.deferUpdate();
                    break;

                default:
                    break;
            }
        });

        collector.on("end", () => {
            setTimeout(() => {
                playingMessage.delete().catch();
            }, 3000);
        }
        );
    }

    private createButtonsComponents(): ActionRowBuilder<ButtonBuilder> {
        const buttonNext = createButtonComponent('skip', ButtonStyle.Secondary, `${Emojis.Music.next}`);
        const buttonPlayPause = createButtonComponent('playpause', ButtonStyle.Secondary, `${Emojis.Music.pause}`);
        const buttonShuffle = createButtonComponent('shuffle', ButtonStyle.Secondary, `${Emojis.Music.shuffle}`);
        const buttonStop = createButtonComponent('stop', ButtonStyle.Secondary, `${Emojis.Music.stop}`);
        let buttonLoop;
        if (this.loop) {
            buttonLoop = createButtonComponent('loop', ButtonStyle.Success, `${Emojis.Music.loop}`)
        } else {
            buttonLoop = createButtonComponent('loop', ButtonStyle.Danger, `${Emojis.Music.loop}`)
        }
        const row = new ActionRowBuilder<ButtonBuilder>();

        row.addComponents(buttonPlayPause, buttonNext, buttonLoop, buttonShuffle, buttonStop);
        return row;
    }

    private modifySendedEmbedByButtonPressed(): ActionRowBuilder<ButtonBuilder> {
        let buttonPlayPause;
        let buttonLoop;

        if (this.player.state.status == AudioPlayerStatus.Playing) {
            buttonPlayPause = createButtonComponent('playpause', ButtonStyle.Secondary, `${Emojis.Music.pause}`);
        } else {
            buttonPlayPause = createButtonComponent('playpause', ButtonStyle.Secondary, `${Emojis.Music.play}`);
        }

        if (this.loop) {
            buttonLoop = createButtonComponent('loop', ButtonStyle.Success, `${Emojis.Music.loop}`)
        } else {
            buttonLoop = createButtonComponent('loop', ButtonStyle.Danger, `${Emojis.Music.loop}`)
        }
        const buttonNext = createButtonComponent('skip', ButtonStyle.Secondary, `${Emojis.Music.next}`);
        const buttonShuffle = createButtonComponent('shuffle', ButtonStyle.Secondary, `${Emojis.Music.shuffle}`);
        const buttonStop = createButtonComponent('stop', ButtonStyle.Secondary, `${Emojis.Music.stop}`);

        const row = new ActionRowBuilder<ButtonBuilder>();

        row.addComponents(buttonPlayPause, buttonNext, buttonLoop, buttonShuffle, buttonStop);
        return row;
    }

    static canModifyQueue(message: Message, member?: GuildMember): boolean {
        if (member) {
            if (member.voice.channelId !== bot.queue.get(message.guild!.id)!.connection.joinConfig.channelId) return false;
            return true;
        } else {
            if (message.member!.voice.channelId !== bot.queue.get(message.guild!.id)!.connection.joinConfig.channelId) return false;
            return true;
        }
    }
}