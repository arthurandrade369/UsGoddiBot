import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { CommandsProvider } from "@src/providers/commandsProvider";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const resume: iCommand = {
    name: 'resume',
    description: 'Resume a musica pausada',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<Message<boolean> | void> {
        const queue = bot.queue.get(message.guild!.id);
        if (!queue) return;
        if (queue.player.unpause()) {
            return message.reply('Player resumido');
        }

        return;
    },
}

export default resume;