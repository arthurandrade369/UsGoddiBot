import { iCommand } from "@src/interfaces/iCommand";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const queue: iCommand = {
    name: 'queue',
    description: 'Envia informações sobre a queue',
    group: Groups.music,
    aliases: ['q'],
    permission: ['everyone'],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        
    },
}

export default queue;