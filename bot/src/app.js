const config = require('./config/config.js');
const fs = require('fs');

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

    const functionDirs = fs.readdirSync('./src/functions');
    
    for (const dir of functionDirs) {
    
        const functionDirPath = `./src/functions/${dir}`;
    
        // Ignore files in the functions root
        if (!fs.statSync(functionDirPath).isDirectory()) {
            continue;
        }
    
        const functionFiles = fs
            .readdirSync(functionDirPath)
            .filter(file => file.endsWith('.js'));
    
        for (const file of functionFiles) {
    
            const functionPath = `./functions/${dir}/${file}`;
            const functionModule = require(functionPath);
    
            // Database model
            if (
                dir === 'models' &&
                typeof functionModule === 'object' &&
                typeof functionModule.initialize === 'function'
            ) {
                try {

                    await functionModule.initialize();
    
                    console.log(
                        `Database model initialized: ${file}`
                    );

                } catch (error) {
    
                    console.error(
                        `Failed to initialize database model: ${file}`,
                        error
                    );
    
                    process.exit(1);
                }
    
                continue;
            }
    
            // Normal function module
            if (typeof functionModule === 'function') {
                functionModule(client);
                continue;
            }
    
            // Unknown module
            console.log(
                `Skipping invalid function module: ${dir}/${file}`
            );
        }
    }
    

    client.events();

    await client.login(config.bot.token);
}

startBot().catch(err => {
    console.error('Fatal Error starting Voxel:', err);
    process.exit(1);
})