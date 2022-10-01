import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";
import { SongQueue } from '@src/model/SongQueue';

const pause: iCommand = {
    name: 'pause',
    description: 'Pausa a musica em reprodução',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<Message<boolean> | void> {
        const queue = bot.queue.get(message.guild!.id);
        if (!queue) return;

        if (!SongQueue.canModifyQueue(message)) return message.channel.send('❌  **|Você não está no mesmo canal que o Bot**');

        if (queue.player.pause()) {
            return message.channel.send('Pausado...');
        }
        return;
    },
}

export default pause;