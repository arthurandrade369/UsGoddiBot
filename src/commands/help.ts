import '../utils/module-alias';
import { Message } from 'discord.js';
import type { iCommand } from '@src/interfaces/iCommand';
import { bot } from '@src/index';
import { CommandsProvider } from '@src/providers/commandsProvider';


const help: iCommand = {
    name: 'help',
    description: `Mostra comandos e descrições.`,
    detailedDescription: 'Mostra todos os comandos disponiveis ou uma descrição mais detalhada de um comando específico',
    aliases: ['h'],
    permission: ['everyone'],
    cooldown: undefined,
    async execute(message: Message, args: string[]): Promise<void> {

        if (!args.length) {
            const embed = CommandsProvider.getEmbed(message, 'Comandos', 'Lista de comandos disponíveis');
            bot.commands.forEach((command) => {
                embed.addFields({
                    name: `**${command.name}:**`,
                    value: `*${command.description}*`,
                });
            });

            await message.reply({ embeds: [embed] }).catch(console.error);
        } else {
            const command = bot.commands.get(args[0]) ?? bot.commands.find(cmd => cmd.aliases.includes(args[0]))
            if (!command) return;

            const embed = CommandsProvider.getEmbed(message, command.name, command.detailedDescription);

            if (command.args) embed.addFields({ name: `**Argumentos**`, value: `*${command.args}*` });

            await message.reply({ embeds: [embed] }).catch(console.error);
        }
    }
}

export default help;