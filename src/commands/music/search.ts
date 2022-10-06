import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { CommandsCallError } from "@src/model/CommandsError";
import { Groups } from "@src/providers/groups";
import { SongsProvider } from "@src/providers/songsProvider";
import { Message } from "discord.js";
import { Song } from '../../model/Song';

const search: iCommand = {
    name: 'search',
    description: 'Mostra uma lista de musicas para escolher e adicionar à queue',
    group: Groups.music,
    aliases: ['sr'],
    permission: ['everyone'],
    cooldown: undefined,
    active: false,
    async execute(message: Message, search: string[]): Promise<Message | void> {
        const songProvider = new SongsProvider();
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) throw new CommandsCallError(message, 'Você não está em um canal de voz');
        if (!message.guild) return;

        const queue = bot.queue.get(message.guild.id);
        if (queue && voiceChannel.id !== queue.connection.joinConfig.channelId) {
            return message.reply('Você precisa estar no mesmo canal que o Bot').catch(console.error);
        }
        if (!search.length) return message.reply('Tente !help music').catch(console.error);

        const videos = Song.searchSong(search.join(" "));
    },
}

export default search;