import '../utils/module-alias';
import type { Message } from 'discord.js';
import type { iCommand } from '@src/interfaces/iCommand';
import { CommandsProvider } from '@src/providers/commandsProvider';

const avatar: iCommand = {
    name: 'avatar',
    description: `Envia o avatar do usario marcado. Exemplo: \`!avatar @user\``,
    aliases: [],
    cooldown: 3,
    async execute(message: Message, args: string[]): Promise<void> {
        if (!args.length) message.reply('❌  **|  É necessário passar um usuário como target**');

        const guild = message.guild;

        if (!guild?.available) return;

        const members = CommandsProvider.getMembersById(guild, args);

        const avatar = members.map((member) => {
            if (!member) return;
            return {
                id: member.id,
                avatar: member.user.avatar
            };
        })

        const imageLink = avatar.map((user) => {
            if (!user) return;
            return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`;
        })

        imageLink.forEach((image) => {
            if (!image) return;
            message.channel.send(image)
        });
    }
}

export default avatar;
