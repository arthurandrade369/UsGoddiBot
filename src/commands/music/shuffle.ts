import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { SongQueue } from "@src/model/SongQueue";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const shuffle: iCommand = {
    name: 'shuffle',
    description: 'Embaralha a queue',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<void> {
        const queue = bot.queue.get(message.guild!.id);
        if (!queue) return;

        if (!await SongQueue.canModifyQueue(message)) return;

        const songs = queue.songs;

        for (let i = songs.length - 1; i > 1; i--) {
            let j = 1 + Math.floor(Math.random() * i);
            [songs[i], songs[j]] = [songs[j], songs[i]];
        }

        message.channel.send(' **Queue embaralhada** ');
    },
}

export default shuffle;