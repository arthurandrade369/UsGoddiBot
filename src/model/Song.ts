import { iSongData } from "@src/interfaces/iSongData";
import { ytVideoPattern } from "@src/providers/patternRegex";
import { Video, YouTube } from "youtube-sr";
import ytdl from 'ytdl-core-discord';
import { videoInfo } from 'ytdl-core';
import { createAudioResource, StreamType } from "@discordjs/voice";
import internal from "stream";
import { APIEmbed, MessagePayload } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";

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

    public static async songFrom(url = "", search = ""): Promise<iSongData> {
        const isYoutubeUrl = ytVideoPattern.test(url);

        let songInfo: videoInfo | Video;

        if (isYoutubeUrl) {
            songInfo = await ytdl.getInfo(url);

            return {
                url: songInfo.videoDetails.video_url,
                title: songInfo.videoDetails.title,
                duration: parseInt(songInfo.videoDetails.lengthSeconds),
                thumb: songInfo.thumbnail_url
            };
        } else {
            const result = await YouTube.searchOne(search);

            songInfo = await ytdl.getInfo(`https://youtube.com/watch?v=${result.id}`);

            return {
                url: songInfo.videoDetails.video_url,
                title: songInfo.videoDetails.title,
                duration: parseInt(songInfo.videoDetails.lengthSeconds),
                thumb: songInfo.thumbnail_url
            };
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

    public embedMessage(): EmbedBuilder{
        const playingEmbed = new EmbedBuilder(); 
        return playingEmbed;
    }
}