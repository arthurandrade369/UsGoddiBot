import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { SongQueue } from "@src/model/SongQueue";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const shuffle: iCommand = {
    name: 'shuffle',
    description: 'Embaralha as musicas na queue',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<void | Message<boolean>> {
        if (!message.guild) return;
        const queue = bot.queue.get(message.guild.id);
        if (!queue) return;

        if (!SongQueue.canModifyQueue(message)) return message.channel.send('❌  **|Você não está no mesmo canal que o Bot**');

        const songs = queue.songs;

        for (let i = songs.length - 1; i > 1; i--) {
            const j = 1 + Math.floor(Math.random() * i);
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }

        return message.channel.send('Embaralhando...');
    },
}

export default shuffle;