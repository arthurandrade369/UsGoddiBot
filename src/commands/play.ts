import { iCommand } from "@src/interfaces/iCommand";
import { Message } from "discord.js";

const play: iCommand = {
    name: 'play',
    description: 'Inicia reprodução de audio do youtube',
    detailedDescription: '',
    aliases: ['p'],
    permission: [],
    cooldown: undefined,
    async execute(message: Message): Promise<void> {
        message.reply('Positivo capitão broxa');
    },
}

export default play;