import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
export interface iEmbedReturn {
    embed: EmbedBuilder,
    row: ActionRowBuilder<ButtonBuilder>
}