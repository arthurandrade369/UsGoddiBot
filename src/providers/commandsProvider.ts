import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, GuildMember, InteractionCollector, Message, ReplyMessageOptions } from 'discord.js';
import config from '@src/utils/config';
import { iSeparatorReturn } from '@src/interfaces/iSeparatorReturn';
import { bot } from '@src/index';
import { iEmbedReturn } from '@src/interfaces/iEmbedReturn';

export class CommandsProvider {

    /**
     * Separate the command itself of the trigger
     * 
     * @param command 
     * @returns iSeparatorReturn
     */
    static separateTrigger(command: string): iSeparatorReturn | void {
        const args = command.slice(config.general.TRIGGER.length).trim().split(/ +/g);
        const cmd = args.shift()?.toLowerCase();

        if (!cmd) return;

        return {
            command: cmd,
            args: args
        };
    }

    /**
     * Create a custom embed
     * 
     * @param title 
     * @param description 
     * @returns EmbedBuilder
     */
    static getEmbed(message: Message, title: string, description?: string): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setColor('DarkBlue');

        embed.setAuthor({
            name: config.general.BOT_NAME,
            iconURL: 'http://pm1.narvii.com/7613/ab57b8bb348c4c57901780afc219620136fbe953r1-346-346v2_00.jpg',
            url: config.general.INVITE_LINK
        });

        // embed.setThumbnail('https://pbs.twimg.com/profile_images/1215734764323377152/-hmYx6ee_400x400.jpg');
        embed.setTitle(title);
        embed.setFooter({ text: `Requested by : ${message.author.username}#${message.author.discriminator}`, iconURL: `${message.author.avatarURL()}` });
        if (description) embed.setDescription(description);

        return embed;
    }

    static normalizeId(id: string): string {
        return id.replace(/(<|@|!|&|#|>)/g, '');
    }

    /**
     * Search for one or many members by id
     * 
     * @param guild 
     * @param membersId 
     * @returns GuildMember[] | null
     */
    static getMembersById(guild: Guild, membersId: string[]): (GuildMember | null)[] {
        const membersIdClean = membersId.map((id) => {
            return this.normalizeId(id);
        });

        const members = membersIdClean.map((id) => {
            return guild.members.resolve(id);
        })

        return members;
    }

    /**
     * Create a button
     * 
     * @param option 
     * @param buttonStyle 
     * @returns ButtonBuilder
     */
    static createButtonComponent(option: string, buttonStyle: ButtonStyle): ButtonBuilder {
        const button = new ButtonBuilder();
        button.setCustomId(option);
        button.setLabel(option);
        button.setStyle(buttonStyle);

        return button;
    }

    /**
     * Create a embed to made a poll
     * 
     * @param message 
     * @param args 
     */
    static createPoll(message: Message, args: string[]): iEmbedReturn {
        const embed = CommandsProvider.getEmbed(message, 'Votação iniciada', 'Clique para votar');
        const row = new ActionRowBuilder<ButtonBuilder>();

        args.forEach((option) => {
            const button = CommandsProvider.createButtonComponent(option, ButtonStyle.Secondary);
            row.addComponents(button);
        })

        return { embed: embed, row: row };
    }

    static createPollYesNo(message: Message, args: string[], memberToKick: GuildMember): iEmbedReturn {
        const embed = CommandsProvider.getEmbed(message, 'Votação iniciada');
        const row = new ActionRowBuilder<ButtonBuilder>();

        const buttonYes = CommandsProvider.createButtonComponent('Sim', ButtonStyle.Success);
        const buttonNo = CommandsProvider.createButtonComponent('Não', ButtonStyle.Danger);
        row.addComponents(buttonYes);
        row.addComponents(buttonNo);

        return { embed: embed, row: row };
    }
}