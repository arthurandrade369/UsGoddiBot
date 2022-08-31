import { iCommand } from "@src/interfaces/iCommand";
import { Message } from "discord.js";

const clean: iCommand = {
    name: 'clear',
    description: 'Apaga todas as mensagens desde a chegada do bot **⚠  IRÁ  APAGAR  TUDO** ',
    detailedDescription: 'Apaga todas as mensagens, sem filtro, desde que o bot entrou no servidor',
    aliases: [],
    permission: ['administrator'],
    cooldown: undefined,
    async execute(message: Message): Promise<void> {
        const channel = message.channel;
        const messages = channel.messages.cache;
        messages.forEach(message => {
            message.delete();
        })
    },
}

export default clean;