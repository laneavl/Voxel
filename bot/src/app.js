const config = require('./config/config.js');

const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials
} = require('discord.js');

async function startBot() {
    // Create A New Discord Client
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildBans,
            GatewayIntentBits.GuildEmojisAndStickers
        ],

        partials: [
            Partials.Channel
        ]
    });

    await client.login(config.bot.token);
    console.log('Voxel Bot is now online!');
}

startBot().catch(err => {
    console.error('Fatal Error starting Voxel:', err);
    process.exit(1);
})