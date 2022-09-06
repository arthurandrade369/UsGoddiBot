import { iCommand } from "@src/interfaces/iCommand";
import { Message } from "discord.js";

const question: iCommand = {
    name: 'question',
    description: 'Pergunta de sim ou não',
    detailedDescription: 'Inicia uma questão de resposta sim ou não, durante 30 seg qualquer um pode responder',
    aliases: ['p'],
    permission: ['everyone'],
    cooldown: 30000,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        
    },
}

export default question;