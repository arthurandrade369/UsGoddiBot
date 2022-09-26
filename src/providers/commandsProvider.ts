import { Guild, GuildMember } from 'discord.js';
import config from '@src/utils/config';
import { iSeparatorReturn } from '@src/interfaces/iSeparatorReturn';

/**
 * Separate the command itself of the trigger
 * 
 * @param command 
 * @returns iSeparatorReturn
 */
export const separateTrigger = (command: string): iSeparatorReturn | void => {
    const args = command.slice(config.general.TRIGGER.length).trim().split(/ +/g);
    const cmd = args.shift()?.toLowerCase();

    if (!cmd) return;

    return {
        command: cmd,
        args: args
    };
}

export const normalizeId = (id: string): string => {
    return id.replace(/(<|@|!|&|#|>)/g, '');
}

/**
 * Search for one or many members by id
 * 
 * @param guild 
 * @param membersId 
 * @returns GuildMember[] | null
 */
export const getMembersById = (guild: Guild, membersId: string[]): (GuildMember | null)[] => {
    const membersIdClean = membersId.map((id) => {
        return normalizeId(id);
    });

    const members = membersIdClean.map((id) => {
        return guild.members.resolve(id);
    })

    return members;
}
