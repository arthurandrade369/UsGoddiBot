import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { SongQueue } from "@src/model/SongQueue";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const skip: iCommand = {
    name: 'skip',
    description: '',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<Message<boolean> | void> {
        const queue = bot.queue.get(message.guild!.id);
        if (!queue) return;

        if (!await SongQueue.canModifyQueue(message)) return;


        queue.player.stop()

        return message.reply('Player parado');
    },
}

export default skip;