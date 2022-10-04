import { iCommand } from "@src/interfaces/iCommand";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const search: iCommand = {
    name: 'search',
    description: 'Mostra uma lista de musicas para escolher e adicionar à queue',
    group: Groups.music,
    aliases: ['sr'],
    permission: ['everyone'],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        
    },
}

export default search;