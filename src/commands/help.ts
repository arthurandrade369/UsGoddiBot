import '../utils/module-alias';
import { Message } from 'discord.js';
import type { iCommand } from '@src/interfaces/iCommand';
import { bot } from '@src/index';
import { CommandsProvider } from '@src/providers/commandsProvider';
import { CommandsCallError, CommandsInternalError } from '@src/model/CommandsError';


const help: iCommand = {
    name: 'help',
    description: `Mostra comandos e descrições.`,
    detailedDescription: 'Mostra todos os comandos disponiveis ou uma descrição mais detalhada de um comando específico',
    aliases: ['h'],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<void> {
        try {
            if (!args.length) {
                const embed = CommandsProvider.getEmbed(message, 'Lista de Comandos', 'Comandos ativos');
                bot.commands.forEach((command) => {
                    if (command.active) {
                        embed.addFields({
                            name: `**${command.name}:**`,
                            value: `*${command.description}*`,
                        });
                    }
                });

                await message.reply({ embeds: [embed] }).catch(console.error);
            } else {
                const command = bot.commands.get(args[0]) ?? bot.commands.find(cmd => cmd.aliases.includes(args[0]))
                if (!command) throw new CommandsCallError(message, 'Comando não existe');

                const embed = CommandsProvider.getEmbed(message, command.name, command.detailedDescription);

                if (command.args) embed.addFields({ name: `**Argumentos**`, value: `*\`${command.args}\`*` });

                await message.reply({ embeds: [embed] }).catch(console.error);
            }
        } catch (error) {
            if (error instanceof CommandsCallError) error.sendResponse();
            if (error instanceof CommandsInternalError) error.logError();
        }
    }
}

export default help;