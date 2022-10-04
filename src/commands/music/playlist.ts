import { iCommand } from "@src/interfaces/iCommand";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const playlist: iCommand = {
    name: 'playlist',
    description: 'Semelhante ao comando !play, porem adiciona uma playlist inteira à queue',
    group: Groups.music,
    aliases: ['pl'],
    permission: ['everyone'],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {

    },
}

export default playlist;