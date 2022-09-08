import { VoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";

export interface iQueueArgs {
    connection: VoiceConnection;
    message: Message;
}
