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

        if (await SongQueue.canModifyQueue(message)) return;

        if (!queue) return;
        queue.loop = true;
        message.channel.send(' **Loop ativado** ');
    },
}

export default loop;