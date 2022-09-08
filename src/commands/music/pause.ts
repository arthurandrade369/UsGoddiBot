import { iCommand } from "@src/interfaces/iCommand";
import { Message } from "discord.js";

const pause: iCommand = {
    name: 'pause',
    description: '',
    group: 'music',
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        
    },
}

export default pause;