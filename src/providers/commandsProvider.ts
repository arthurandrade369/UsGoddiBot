import { ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, GuildMember } from 'discord.js';
import config from '@src/utils/config';

type separatorReturn = {
    command: string,
    args: string[]
}

export class CommandsProvider {
    /**
     * 
     * @param command 
     * @returns Record<string, unknown>
     */
    static separateTrigger(command: string): separatorReturn | null {
        const args = command.slice(config.general.TRIGGER.length).trim().split(/ +/g);
        const cmd = args.shift()?.toLowerCase();

        if (!cmd) return null;

        return {
            command: cmd,
            args: args
        };
    }

    static getEmbed() {
        const embed = new EmbedBuilder()
            .setColor('DarkBlue');

        embed.setAuthor({
            name: config.general.BOT_NAME,
            iconURL: 'http://pm1.narvii.com/7613/ab57b8bb348c4c57901780afc219620136fbe953r1-346-346v2_00.jpg',
            url: config.general.INVITE_LINK
        });

        embed.setThumbnail('https://pbs.twimg.com/profile_images/1215734764323377152/-hmYx6ee_400x400.jpg');

        return embed;
    }

    static getMembersById(guild: Guild, membersId: string[]): (GuildMember | null)[] {
        const membersIdClean = membersId.map((id) => {
            return id.replace(/(<|@|!|>)/g, '');
        });

        const members = membersIdClean.map((id) => {
            return guild.members.resolve(id);
        })

        return members;
    }

    static createButtonComponent(option: string, buttonStyle: ButtonStyle): ButtonBuilder {
        const button = new ButtonBuilder();
        button.setCustomId(option);
        button.setLabel(option);
        button.setStyle(buttonStyle);

        return button;
    }
}