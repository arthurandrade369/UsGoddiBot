import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { SongQueue } from "@src/model/SongQueue";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const skip: iCommand = {
    name: 'skip',
    description: 'Pula para a proxima musica na queue',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message): Promise<Message<boolean> | void> {
        if (!message.guild) return;
        const queue = bot.queue.get(message.guild.id);
        if (!queue) return;

        if (!SongQueue.canModifyQueue(message)) return message.channel.send('❌  **|Você não está no mesmo canal que o Bot**');


        queue.player.stop()

        return message.channel.send('Pulando...');
    },
}

export default skip;