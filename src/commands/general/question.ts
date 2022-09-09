import { iCommand } from "@src/interfaces/iCommand";
import { Groups } from "@src/providers/Groups";
import { Message } from "discord.js";

const question: iCommand = {
    name: 'question',
    description: 'Pergunta de sim ou não',
    group: Groups.general,
    aliases: ['p'],
    permission: ['everyone'],
    cooldown: 30000,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        
    },
}

export default question;