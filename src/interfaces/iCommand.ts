import type { Message } from 'discord.js';

export interface iCommand {
    name: string;
    description: string;
    detailedDescription: string;
    args?: string;
    aliases: string[];
    permission: string[]
    cooldown?: number;
    execute(message: Message, args?: string | string[]): Promise<void>;
}