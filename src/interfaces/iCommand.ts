import type { Message } from 'discord.js';

export interface iCommand {
    name: string;
    description: string;
    aliases: string[];
    cooldown?: number;
    execute(message: Message, args: string | string[] | null): Promise<void>;
}