import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { getEmbed } from "@src/providers/embedProvider";
import { Groups } from "@src/providers/groups";
import { Message } from "discord.js";

const lyrics: iCommand = {
    name: 'lyrics',
    description: 'Envia a letra da musica atual',
    group: Groups.music,
    aliases: [],
    permission: ['everyone'],
    cooldown: undefined,
    active: false,
    async execute(message: Message, args: string[]): Promise<void> {
        if (!message.guild) return;
        const queue = bot.queue.get(message.guild.id);
        if (!queue) return;

        const song = queue.songs[0];
        const lyrics = 'lyrics here';

        const lyricsEmbedMessage = getEmbed(message, `Letra de ${song.title}`, lyrics);

        await message.reply({
            embeds: [lyricsEmbedMessage]
        });
    },
}

export default lyrics;