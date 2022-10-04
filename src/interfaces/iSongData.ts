import { GuildMember } from 'discord.js';
export interface iSongData {
    title: string;
    url: string;
    duration: string;
    thumb: string;
    artist: string;
    member: GuildMember;
}