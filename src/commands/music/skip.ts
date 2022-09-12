import { iCommand } from "@src/interfaces/iCommand";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const skip: iCommand = {
    name: 'skip',
    description: '',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        
    },
}

export default skip;