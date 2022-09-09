import { iCommand } from "@src/interfaces/iCommand";
import { Groups } from "@src/providers/Groups";
import { Message } from "discord.js";

const shuffle: iCommand = {
    name: 'shuffle',
    description: '',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        
    },
}

export default shuffle;