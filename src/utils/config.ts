import 'dotenv/config';
export default {
    general: {
        TOKEN: process.env['TOKEN'],
        BOT_NAME: 'UsGoddi',
        TRIGGER: '!',
        LOCALE: 'en',
        INVITE_LINK: 'https://discord.com/api/oauth2/authorize?client_id=1003658531846758490&permissions=8&scope=bot'
    },
    voice: {
        "STAY_TIME": 0.25, // In minutes
    },
    music: {
        PLAYLIST_MAX_SIZE: 100,
    }
}