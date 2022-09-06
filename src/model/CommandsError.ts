import { Message } from "discord.js";

export class CommandsCallError extends Error {
    public discMessage: Message;
    constructor(discMessage: Message, error: string) {
        super(error);
        this.discMessage = discMessage;
        this.message = error;
        this.name = "CommandsError";
    }

    public sendResponse(): void {
        this.discMessage.reply(`❌  **|  ${this.message} **`);
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
    }
}