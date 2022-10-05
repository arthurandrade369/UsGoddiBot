import config from "@src/utils/config";
import { Playlist as YouTubePlaylist, YouTube } from "youtube-sr";
import { Song } from './Song';
import { GuildMember } from 'discord.js';
import { ytPlaylistPattern } from "@src/providers/patternRegex";

export class Playlist {
    public data: YouTubePlaylist;
    public videos: Song[];

    public constructor(playlist: YouTubePlaylist, member: GuildMember) {
        this.data = playlist;

        this.videos = this.data.videos
            .filter((video) => video.title != "Private video" && video.title != "Deleted video")
            .slice(0, config.music.PLAYLIST_MAX_SIZE - 1)
            .map((video) => {
                const thumb = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;
                return new Song({
                    url: `https://youtube.com/watch?v=${video.id}`,
                    title: video.title!,
                    duration: `${video.duration / 1000}`,
                    artist: video.channel?.name!,
                    thumb: thumb,
                    member: member,
                })
            });
    }

    public static async from(url = "", search = "", member: GuildMember) {
        const urlValid = ytPlaylistPattern.test(url);
        let playlist;

        if (urlValid) {
            playlist = await YouTube.getPlaylist(url);
        } else {
            const result = await YouTube.searchOne(search, "playlist");
            playlist = await YouTube.getPlaylist(result.url!);
        }

        return new this(playlist, member);
    }
}