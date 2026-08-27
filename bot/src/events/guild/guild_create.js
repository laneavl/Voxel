const getConnection = require('../../functions/database/connectDatabase');

console.log(
    `DB Record Creation Event Started at ${new Date().toLocaleString()}`
);

module.exports = {
    name: 'guildCreate',
    once: false,

    async execute(guild, client) {
        let connection;

        try {
            connection = await getConnection();

            const [enableRows] = await connection.query(
                'SELECT guild_id FROM feature_config WHERE guild_id = ?',
                [guild.id]
            );

            const [channelRows] = await connection.query(
                'SELECT guild_id FROM channel_config WHERE guild_id = ?',
                [guild.id]
            );

            const [miscRows] = await connection.query(
                'SELECT guild_id FROM misc_config WHERE guild_id = ?',
                [guild.id]
            );

            const [userRows] = await connection.query(
                'SELECT guild_id FROM user_config WHERE guild_id = ?',
                [guild.id]
            );

            const [loggerChannelRows] = await connection.query(
                'SELECT guild_id FROM logger_channel_config WHERE guild_id = ?',
                [guild.id]
            );

            const [loggerEnableRows] = await connection.query(
                'SELECT guild_id FROM logger_enable_config WHERE guild_id = ?',
                [guild.id]
            );



            if (!enableRows.length) {
                await connection.query(
                    'INSERT INTO feature_config (guild_id, guild_name) VALUES (?, ?)',
                    [guild.id, guild.name]
                );

                console.log('Created Enable/Disable Record');
            }

            if (!channelRows.length) {
                await connection.query(
                    'INSERT INTO channel_config (guild_id, guild_name) VALUES (?, ?)',
                    [guild.id, guild.name]
                );

                console.log('Created Channel ID Record');
            }

            if (!miscRows.length) {
                await connection.query(
                    'INSERT INTO misc_config (guild_id, guild_name) VALUES (?, ?)',
                    [guild.id, guild.name]
                );

                console.log('Created Misc Record');
            }

            if (!loggerChannelRows.length) {
                await connection.query(
                    'INSERT INTO logger_channel_config (guild_id, guild_name) VALUES (?, ?)',
                    [guild.id, guild.name]
                );

                console.log('Created Logger Channel Record');
            }

            if (!loggerEnableRows.length) {
                await connection.query(
                    'INSERT INTO logger_enable_config (guild_id, guild_name) VALUES (?, ?)',
                    [guild.id, guild.name]
                );

                console.log('Created Logger Enable Record');
            }

            console.log(
                `Joined guild "${guild.name}" with ID "${guild.id}"`
            );
        } catch (error) {
            console.error('Error handling guildCreate event:', error);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
};