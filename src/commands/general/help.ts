import { Message } from 'discord.js';
import type { iCommand } from '@src/interfaces/iCommand';
import { bot } from '@src/index';
import { getEmbed } from '@src/providers/embedProvider';
import { CommandsCallError, CommandsInternalError } from '@src/model/CommandsError';
import { Groups } from "@src/providers/groups";


const help: iCommand = {
    name: 'help',
    description: `Mostra comandos e descrições.`,
    group: Groups.general,
    aliases: ['h'],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, args: string[]): Promise<void> {
        try {
            if (!args.length) {
                const embed = getEmbed(message, 'Lista de Comandos por grupos', 'Tente !help [grupo]');
                bot.groups.forEach(group => {
                    const commands = getArrayFromCommandCollection(group.groupName);
                    const command = getStringFromArrayOfCommands(commands);

                    embed.addFields({
                        name: `*${group.groupName} :*`,
                        value: command,
                    });
                });

                await message.reply({ embeds: [embed] }).catch(console.error);
            } else {
                const group = bot.groups.find((group, key) => key.includes(args[0].toLowerCase()));
                if (!group) throw new CommandsInternalError(`Commands groups not found: ${args[0]}`);

                const commands = bot.commands.map(command => {
                    if (group.groupName === command.group) return command;

                    return undefined
                });

                const embed = getEmbed(message, `\`${group.groupName}\``);

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
    const commands: string[] = [];
    bot.commands.map(command => {
        if (command.group.includes(group)) return command.name;
        return undefined;
    }).forEach(command => { if (command) commands.push(command) });

    return commands;
}