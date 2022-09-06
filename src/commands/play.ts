
import { iCommand } from "@src/interfaces/iCommand";
import { CommandsCallError, CommandsInternalError } from "@src/model/CommandsError";
import { Message, VoiceChannel } from 'discord.js';
import { createAudioPlayer, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection } from '@discordjs/voice';

const play: iCommand = {
    name: 'play',
    description: 'Inicia reprodução de audio do youtube',
    detailedDescription: '',
    aliases: ['p'],
    permission: [],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<void> {
        try {
            if (!message.member!.voice.channel) throw new CommandsCallError(message, 'Você não está em um canal de voz');
            const VoiceChannel = message.member?.voice.channel;
            const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play }});
            const connection = joinVoiceChannel({
                channelId: VoiceChannel!.id,
                guildId: VoiceChannel!.guildId,
                adapterCreator: VoiceChannel!.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
            });
                        
        } catch (error) {
            if (error instanceof CommandsCallError) error.sendResponse();
            if (error instanceof CommandsInternalError) error.logError();
            console.log(error);
        }
    }
}
export default play;