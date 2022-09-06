import { iCommand } from "@src/interfaces/iCommand";
import { Message } from "discord.js";

const clean: iCommand = {
    name: 'clear',
    description: 'Apaga todas as ultimas 100 mensagens',
    detailedDescription: 'Apaga todas as 100 ultimas mensagens, sem filtro',
    aliases: [],
    permission: ['ADMINISTRADOR'],
    cooldown: undefined,
    active: true,
    async execute(message: Message): Promise<void> {
        const channel = message.channel;
        const messages = await channel.messages.fetch({limit: 100});
        messages.forEach(message => {
            message.delete();
        })
    },
}

export default clean;