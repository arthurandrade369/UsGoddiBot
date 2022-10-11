import { iEmbedReturn } from "@src/interfaces/iEmbedReturn";
import config from "@src/utils/config";
import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from "discord.js";

/**
 * Create a custom embed
 * 
 * @param title 
 * @param description 
 * @returns EmbedBuilder
 */
export const getEmbed = (message: Message, title: string, description?: string): EmbedBuilder => {
    const embed = new EmbedBuilder()
        .setColor("DarkBlue");

    embed.setAuthor({
        name: config.general.BOT_NAME,
        iconURL: config.bot.iconUrl,
        url: config.general.INVITE_LINK
    });

    embed.setTitle(title);
    embed.setFooter({
        text: `Pedido por: ${message.author.username}#${message.author.discriminator}`,
        iconURL: `${message.author.avatarURL()}`
    });
    if (description) embed.setDescription(description);

    return embed;
}

/**
 * Create a button
 * 
 * @param option 
 * @param buttonStyle 
 * @returns ButtonBuilder
 */
export const createButtonComponent = (option: string, buttonStyle: ButtonStyle, label?: string): ButtonBuilder => {
    const button = new ButtonBuilder();
    button.setCustomId(option);
    label ? button.setLabel(label) : button.setLabel(option);
    button.setStyle(buttonStyle);

    return button;
}

/**
 * Create a embed to made a poll
 * 
 * @param message 
 * @param args 
 */
export const createPoll = (message: Message, args: string[]): iEmbedReturn => {
    const embed = getEmbed(message, 'Votação iniciada', 'Clique para votar');
    const row = new ActionRowBuilder<ButtonBuilder>();

    args.forEach((option) => {
        const button = createButtonComponent(option, ButtonStyle.Secondary);
        row.addComponents(button);
    })

    return { embed: embed, row: row };
}

export const createPollYesNo = (message: Message, fields: APIEmbedField[]): iEmbedReturn => {
    const embed = getEmbed(message, 'Votação iniciada');
    const row = new ActionRowBuilder<ButtonBuilder>();

    embed.addFields(fields);
    const buttonYes = createButtonComponent('Sim', ButtonStyle.Success);
    const buttonNo = createButtonComponent('Não', ButtonStyle.Danger);
    row.addComponents(buttonYes);
    row.addComponents(buttonNo);

    return { embed: embed, row: row };
}