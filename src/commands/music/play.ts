
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { CommandsCallError, CommandsInternalError } from "@src/model/CommandsError";
import { MusicQueue, Song } from "@src/model/MusicQueue";
import { Groups } from "@src/providers/Groups";
import { Message } from 'discord.js';
import { YouTube } from "youtube-sr";

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

            let song;

            try {
                song = await Song.from(url.url, music.join(" "));
            } catch (error) {
                console.error(error);
                message.reply('Error').catch(console.error);
            }

            const newQueue = new MusicQueue({
                message,
                connection: joinVoiceChannel({
                    channelId: VoiceChannel!.id,
                    guildId: message.guild!.id,
                    adapterCreator: message.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator
                })
            });

            if (!song) return;
            newQueue.enqueue(song);


        } catch (error) {
            if (error instanceof CommandsCallError) error.sendResponse();
            if (error instanceof CommandsInternalError) error.logError();
            console.log(error);
        }
    }
}
export default play;