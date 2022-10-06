import 'dotenv/config';
export default {
    bot:{
        iconUrl: 'http://pm1.narvii.com/7613/ab57b8bb348c4c57901780afc219620136fbe953r1-346-346v2_00.jpg',
        embedColor: 'DarkBlue',
    },
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