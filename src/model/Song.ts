import { iSongData } from "@src/interfaces/iSongData";
import { ytVideoPattern } from "@src/providers/patternRegex";
import { Video, YouTube } from "youtube-sr";
import ytdl from 'ytdl-core-discord';
import { videoInfo } from 'ytdl-core';
import { createAudioResource, StreamType } from "@discordjs/voice";
import internal from "stream";
import { Message } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";
import config from "@src/utils/config";

export class Song {
    public readonly url;
    public readonly title;
    public readonly duration;
    public readonly thumb;

    constructor({ url, title, duration, thumb }: iSongData) {
        this.url = url;
        this.title = title;
        this.duration = duration;
        this.thumb = thumb;
    }

    public static async songFrom(url = "", search = ""): Promise<Song> {
        const isYoutubeUrl = ytVideoPattern.test(url);

        let songInfo: videoInfo | Video;

        if (isYoutubeUrl) {
            songInfo = await ytdl.getInfo(url);

            return new this({
                url: songInfo.videoDetails.video_url,
                title: songInfo.videoDetails.title,
                duration: songInfo.videoDetails.lengthSeconds,
                thumb: songInfo.thumbnail_url
            });
        } else {
            const result = await YouTube.searchOne(search);

            songInfo = await ytdl.getInfo(`https://youtube.com/watch?v=${result.id}`);

            return new this({
                url: songInfo.videoDetails.video_url,
                title: songInfo.videoDetails.title,
                duration: songInfo.videoDetails.lengthSeconds,
                thumb: songInfo.tag_for_children_directed
            });
        }
    }

    public async makeResource() {
        let stream: internal.Readable | undefined;

        const type = this.url.includes("youtube.com") ? StreamType.Opus : StreamType.OggOpus;

        const source = this.url.includes("youtube") ? "youtube" : "soundcloud";

        if (source === "youtube") {
            stream = await ytdl(this.url, { quality: "highestaudio", highWaterMark: 1 << 25 });
        }

        if (!stream) return;

        return createAudioResource(stream, {
            metadata: this,
            inputType: type,
        });
    }

    public embedMessage(message: Message): EmbedBuilder {
        const playingEmbed = new EmbedBuilder();

        playingEmbed.setAuthor({
            name: config.general.BOT_NAME,
            iconURL: 'http://pm1.narvii.com/7613/ab57b8bb348c4c57901780afc219620136fbe953r1-346-346v2_00.jpg',
            url: config.general.INVITE_LINK
        });

        playingEmbed.setTitle(this.title);
        playingEmbed.setURL(this.url);
        playingEmbed.setThumbnail(this.thumb);
        playingEmbed.setDescription(this.duration);

        playingEmbed.setFooter({
            text: `Requested by : ${message.author.username}#${message.author.discriminator}`,
            iconURL: `${message.author.avatarURL()}`
        });
        return playingEmbed;
    }
}