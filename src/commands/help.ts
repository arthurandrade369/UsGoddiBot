import '../utils/module-alias';
import { Message } from 'discord.js';
import type { iCommand } from '@src/interfaces/iCommand';
import { bot } from '@src/index';
import { CommandsProvider } from '@src/providers/commandsProvider';


const help: iCommand = {
    name: 'help',
    description: `Mostra comandos e descrições.`,
    aliases: ['h'],
    cooldown: undefined,
    async execute(message: Message): Promise<void> {
        const embed = CommandsProvider.getEmbed();
        embed.setTitle('Comandos');
        embed.setDescription('Lista de comandos disponíveis')

        bot.commands.forEach((command) => {
            embed.addFields({
                name: `**${command.name}:**`,
                value: `*${command.description}*`,
            });
        });

        await message.reply({ embeds: [embed] }).catch(console.error);
    }
}

export default help;