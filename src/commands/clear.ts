import { iCommand } from "@src/interfaces/iCommand";
import { Message } from "discord.js";

const clean: iCommand = {
    name: 'clear',
    description: 'Limpa o canal de texto por completo. **⚠  IRÁ  APAGAR  TUDO** ',
    aliases: [],
    cooldown: undefined,
    async execute(message: Message): Promise<void> {
        const channel = message.channel;

        const messages = channel.awaitMessages();
        await Promise.all([messages, messages.then(messages => messages.forEach(message => message.delete()))]);

        console.log('ok');
    },
}

export default clean;