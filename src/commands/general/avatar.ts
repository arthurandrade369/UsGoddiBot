import type { Message } from 'discord.js';
import type { iCommand } from '@src/interfaces/iCommand';
import { CommandsProvider } from '@src/providers/commandsProvider';
import { CommandsCallError, CommandsInternalError } from '@src/model/CommandsError';

const avatar: iCommand = {
    name: 'avatar',
    description: 'Envia o avatar do membro marcado.',
    group: 'general',
    args: 'Membro',
    aliases: [],
    permission: [],
    cooldown: 3,
    active: true,
    async execute(message: Message, args: string[]): Promise<void> {
        try {
            if (!args.length) throw new CommandsCallError(message, 'É necessário passar um usuário como target');

            const guild = message.guild;

            if (guild == null || !guild.available) throw new CommandsInternalError('Guild unavailable or unexists');

            const members = CommandsProvider.getMembersById(guild, args);

            const avatar = members.map((member) => {
                if (!member) throw new CommandsCallError(message, 'Membro não existe')
                return member.user.avatarURL()
            })

            avatar.forEach((image) => {
                if (!image) throw new CommandsCallError(message, 'Membro não tem avatar');
                message.reply(image)
            });
        } catch (error) {
            if(error instanceof CommandsCallError) error.sendResponse();
            if(error instanceof CommandsInternalError) error.logError();
        }
    }
}

export default avatar;
