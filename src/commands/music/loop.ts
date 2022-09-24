import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const loop: iCommand = {
    name: 'loop',
    description: '',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        const queue = bot.queue.get(message.guild!.id);
        if (!queue) return;
        queue.loop = true;
    },
}

export default loop;