import type { Message } from 'discord.js';

export interface iCommand {
    name: string;
    description: string;
    group: string;
    args?: string;
    aliases: string[];
    permission: string[];
    cooldown?: number;
    active: boolean;
    execute(message: Message, args?: string[]): Promise<void>;
}