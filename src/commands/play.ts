import { iCommand } from "@src/interfaces/iCommand";
import { Message } from "discord.js";

const play: iCommand = {
    name: 'play',
    description: 'Inicia reprodução de audio do youtube',
    detailedDescription: '',
    aliases: ['p'],
    permission: [],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        
    }
}
export default play;