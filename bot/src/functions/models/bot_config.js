const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS bot_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255),
        guild_name VARCHAR(255),
        rapidApiKey VARCHAR(255) DEFAULT 0,
        urbanApiHost VARCHAR(255) DEFAULT 0,
        redditApiHost VARCHAR(255) DEFAULT 0,
        openAiApiKey VARCHAR(255) DEFAULT 0,
        webhookURL VARCHAR(255) DEFAULT 0,
        eightballURL VARCHAR(255) DEFAULT 0,
        subredditsURL VARCHAR(255) DEFAULT 0,
        rssURL VARCHAR(255) DEFAULT 0,
        funfactURL VARCHAR(255) DEFAULT 0
    )
`;

// Initialize the bot_config table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: bot_config');
    } catch (error) {
        console.error(
            'Failed to initialize bot_config:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get the bot configuration for a guild
async function get(guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM bot_config
            WHERE guild_id = ?
            LIMIT 1
            `,
            [guildId]
        );

        return rows[0] || null;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Create a miscellaneous configuration row for a guild
async function create(guildId, guildName) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO bot_config
            (
                guild_id,
                guild_name
            )
            VALUES (?, ?)
            `,
            [
                guildId,
                guildName
            ]
        );

        return result.insertId;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Update a miscellaneous configuration value
// Example: await set (guildId, 'master_color', '#5865F2');
async function set(guildId, setting, value) {
    const allowedSettings = [
        'rapidApiKey',
        'urbanApiHost',
        'redditApiHost',
        'openAiApiKey',
        'webhookURL',
        'eightballURL',
        'subredditsURL',
        'rssURL',
        'funfactURL'
    ];

    if (!allowedSettings.includes(setting)) {
        throw new Error(
            `Invalid bot_config setting: ${setting}`
        );
    }

    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE bot_config
            SET ${setting} = ?
            WHERE guild_id = ?
            `,
            [
                value,
                guildId
            ]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Delete a guild's miscellaneous configuration
async function remove(guildId) {
    let connection;

    try {
        connection = await getConnection();
        const [result] = await connection.query(
            `
            DELETE FROM bot_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    initialize,
    get,
    create,
    set,
    remove
};