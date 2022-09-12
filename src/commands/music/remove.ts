import { iCommand } from "@src/interfaces/iCommand";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const remove: iCommand = {
    name: 'remove',
    description: '',
    group: Groups.music,
    aliases: ['rm'],
    permission: ['everyone'],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        
    },
}

export default remove;