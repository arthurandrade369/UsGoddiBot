import './utils/module-alias';
import { Client, GatewayIntentBits } from 'discord.js';
import { Bot } from '@src/model/Bot';

export const bot = new Bot(
    new Client({
        rest: {
            offset: 0
        },
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildBans,
        ],
    }));