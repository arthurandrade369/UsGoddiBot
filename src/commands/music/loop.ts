import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { SongQueue } from "@src/model/SongQueue";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const loop: iCommand = {
    name: 'loop',
    description: 'Ativa a opção de loop da queue',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<Message<boolean> | void> {
        const queue = bot.queue.get(message.guild!.id);
        if (!queue) return;

        if (!SongQueue.canModifyQueue(message)) return message.channel.send('❌  **|Você não está no mesmo canal que o Bot**');

        queue.loop = queue.loop ? false : true;
        return message.channel.send('Loop...');
    },
}

export default loop;