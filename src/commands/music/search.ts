import { bot } from "@src/index";
import { iCommand } from "@src/interfaces/iCommand";
import { CommandsCallError } from "@src/model/CommandsError";
import { Groups } from "@src/providers/groups";
import { SongsProvider } from "@src/providers/songsProvider";
import { ActionRowBuilder, Message, ButtonBuilder, ButtonStyle, User, ButtonInteraction, CacheType, ComponentType } from 'discord.js';
import { Song } from '@src/model/Song';
import { CommandsInternalError } from '@src/model/CommandsError';
import { createButtonComponent } from "@src/providers/embedProvider";

const search: iCommand = {
    name: 'search',
    description: 'Mostra uma lista de musicas para escolher e adicionar à queue',
    group: Groups.music,
    aliases: ['sr'],
    permission: ['everyone'],
    cooldown: undefined,
    active: true,
    async execute(message: Message, search: string[]): Promise<Message | void> {
        const songProvider = new SongsProvider();
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) throw new CommandsCallError(message, 'Você não está em um canal de voz');
        if (!message.guild) throw new CommandsInternalError('Guild inexists');

        const queue = bot.queue.get(message.guild.id);
        if (queue && voiceChannel.id !== queue.connection.joinConfig.channelId) {
            return message.reply('Você precisa estar no mesmo canal que o Bot').catch(console.error);
        }
        if (!search.length) return message.reply('Tente !help music').catch(console.error);

        const videos = await Song.searchSong(search.join(" "));

        const searchEmbed = songProvider.getSearchSongEmbedMessage(message, videos);
        const searchRow = getSearchButtons(videos.length);

        const searchEmbedMessage = await message.reply({
            embeds: [searchEmbed],
            components: [searchRow]
        });

        const filter = (interected: ButtonInteraction<CacheType>) => message.author.id === interected.member?.user.id;
        const collector = searchEmbedMessage.createMessageComponentCollector({ filter, time: 60000, componentType: ComponentType.Button });

        collector.on('collect', (interacted) => {
            switch (interacted.customId) {
                case '1':
                    bot.commands.get('play')?.execute(message, [videos[0].url]);
                    interacted.deferUpdate();
                    break;
                case '2':
                    bot.commands.get('play')?.execute(message, [videos[1].url]);
                    interacted.deferUpdate();
                    break;
                case '3':
                    bot.commands.get('play')?.execute(message, [videos[2].url]);
                    interacted.deferUpdate();
                    break;
                case '4':
                    bot.commands.get('play')?.execute(message, [videos[3].url]);
                    interacted.deferUpdate();
                    break;
                case '5':
                    bot.commands.get('play')?.execute(message, [videos[4].url]);
                    interacted.deferUpdate();
                    break;

                default:
                    break;
            }
        });
    },
}

export default search;

function getSearchButtons(buttonQuantity: number): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (let i = 1; i <= buttonQuantity; i++) {
        let button = createButtonComponent(`${i}`, ButtonStyle.Primary, `${i}`);
        row.addComponents(button);
    }

    return row;
}