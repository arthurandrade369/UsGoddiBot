import { Message } from 'discord.js';
import type { iCommand } from '@src/interfaces/iCommand';
import { bot } from '@src/index';
import { CommandsProvider } from '@src/providers/commandsProvider';
import { CommandsCallError, CommandsInternalError } from '@src/model/CommandsError';
import config from '@src/utils/config';


const help: iCommand = {
    name: 'help',
    description: `Mostra comandos e descrições.`,
    group: 'general',
    aliases: ['h'],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<void> {
        try {
            if (!args.length) {
                const embed = CommandsProvider.getEmbed(message, 'Lista de Comandos por grupos', 'Tente !help [grupo]');
                bot.groups.forEach(group => {
                    const commands = getArrayFromCommandCollection(group.group);
                    const command = getStringFromArrayOfCommands(commands);

                    embed.addFields({
                        name: `*${group.group} :*`,
                        value: command,
                    });
                });

                await message.reply({ embeds: [embed] }).catch(console.error);
            } else {
                const group = bot.groups.get(args[0]);
                if (!group) throw new CommandsInternalError(`Commands groups not found: ${args[0]}`);

                const commands = bot.commands.map(command => {
                    if (group.group === command.group) return command;

                    return undefined
                });

                const embed = CommandsProvider.getEmbed(message, `\`${group.group}\``);

                commands.forEach(command => {
                    if (!command) return;
                    if (!command.active) return;

                    embed.addFields({
                        name: `*${command.name} :*`,
                        value: `*${command.description}*`,
                    });
                });

                await message.reply({ embeds: [embed] }).catch(console.error);
            }
        } catch (error) {
            if (error instanceof CommandsCallError) error.sendResponse();
            if (error instanceof CommandsInternalError) error.logError();
        }
    }
}

export default help;

function getStringFromArrayOfCommands(array: string[]): string {
    let string = '';
    array.forEach(stringArray => string += `\`${stringArray}\` | `);
    return string;
}

function getArrayFromCommandCollection(group: string): string[] {
    let commands: string[] = [];
    bot.commands.map(command => {
        if (command.group.includes(group)) return command.name;
        return undefined;
    }).forEach(command => { if (command) commands.push(command) });

    return commands;
}