import { Message } from "discord.js";

export class CommandsCallError extends Error {
    public discordMessage: Message;
    constructor(discordMessage: Message, error: string) {
        super(error);
        this.discordMessage = discordMessage;
        this.message = error;
        this.name = "CommandsError";
    }

    public sendResponse(): void {
        this.discordMessage.reply(`❌  **|  ${this.message} **`);
        console.log(this.message);
        console.error(this.message);
    }
}

export class CommandsInternalError extends Error {
    constructor(error: string) {
        super(error);
        this.message = error;
        this.name = "CommandsInternalError";
    }

    public logError(): void {
        console.log(this.message);
        console.error(this.message);
    }

}

export class MemberNotInSameVoiceChannel extends Error {
    private discordMessage: Message;
    constructor(discMessage: Message, error: string) {
        super(error);
        this.discordMessage = discMessage;
        this.message = error;
        this.name = "MemberNotInSameVoiceChannel"
    }

    public sendResponse(): void {
        this.discordMessage.reply(`❌  **|  ${this.message} **`);
        console.log(this.message);
        console.error(this.message);
    }
}