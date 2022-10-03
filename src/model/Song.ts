import { iSongData } from "@src/interfaces/iSongData";
import { ytVideoPattern } from "@src/providers/patternRegex";
import { Video, YouTube } from "youtube-sr";
import ytdl from 'ytdl-core-discord';
import { videoInfo } from 'ytdl-core';
import { createAudioResource, StreamType } from "@discordjs/voice";
import internal from "stream";
import { Message } from "discord.js";
import { EmbedBuilder } from "@discordjs/builders";
import { SongsProvider } from '../providers/songsProvider';

export class Song {
    public readonly url: string;
    public readonly title: string;
    public readonly duration: string;
    public readonly thumb: string;
    public readonly artist: string;
    public songsProvider: SongsProvider;

    constructor({ url, title, duration, thumb, artist }: iSongData) {
        this.url = url;
        this.title = title;
        this.duration = duration;
        this.thumb = thumb;
        this.artist = artist;
        this.songsProvider = new SongsProvider();
    }

    public static async songFrom(url = "", search = ""): Promise<Song> {
        const isYoutubeUrl = ytVideoPattern.test(url);

        let songInfo: videoInfo | Video;
        let thumb;
        if (isYoutubeUrl) {
            songInfo = await ytdl.getInfo(url);
            thumb = `https://i.ytimg.com/vi/${songInfo.videoDetails.videoId}/maxresdefault.jpg`;

            return new this({
                url: songInfo.videoDetails.video_url,
                title: songInfo.videoDetails.title,
                duration: songInfo.videoDetails.lengthSeconds,
                thumb: thumb,
                artist: songInfo.videoDetails.author.name
            });
        } else {
            const result = await YouTube.searchOne(search);

            songInfo = await ytdl.getInfo(`https://youtube.com/watch?v=${result.id}`);
            thumb = `https://i.ytimg.com/vi/${songInfo.videoDetails.videoId}/maxresdefault.jpg`;

            return new this({
                url: songInfo.videoDetails.video_url,
                title: songInfo.videoDetails.title,
                duration: songInfo.videoDetails.lengthSeconds,
                thumb: thumb,
                artist: songInfo.videoDetails.author.name
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
        return this.songsProvider.getSongEmbedMessage(message, this, 'PLAYING');
    }
}