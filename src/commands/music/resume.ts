import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { SongQueue } from "@src/model/SongQueue";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const resume: iCommand = {
    name: 'resume',
    description: 'Despausa a musica pausada',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<Message<boolean> | void> {
        const queue = bot.queue.get(message.guild!.id);
        if (!queue) return;

        if (!SongQueue.canModifyQueue(message)) return message.channel.send('❌  **|Você não está no mesmo canal que o Bot**');

        if (queue.player.unpause()) {
            return message.channel.send('Despausado...');
        }

        return;
    },
}

export default resume;