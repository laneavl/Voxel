const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS channel_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255),
        guild_name VARCHAR(255),
        ai_chat VARCHAR(255) DEFAULT 0,
        bump VARCHAR(255) DEFAULT 0,
        fun_fact VARCHAR(255) DEFAULT 0,
        greeter VARCHAR(255) DEFAULT 0,
        leaver VARCHAR(255) DEFAULT 0,
        rss VARCHAR(255) DEFAULT 0,
        level_up VARCHAR(255) DEFAULT 0,
        modmail VARCHAR(255) DEFAULT 0
    )
`;

// Initialize the channel_config table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: channel_config');
    } catch (error) {
        console.error(
            'Failed to initialize channel_config:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get the channel configuration for a guild
async function get(guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM channel_config
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

// Create a channel configuration row for a guild
async function create(guildId, guildName) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO channel_config
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

// Update a leveling configuration value
// Example: await set (guildId, 'min_xp', 10);
async function set(guildId, setting, value) {
    const allowedSettings = [
        'ai_chat',
        'bump',
        'fun_fact',
        'greeter',
        'leaver',
        'rss',
        'level_up',
        'modmail'
    ];

    if (!allowedSettings.includes(setting)) {
        throw new Error(
            `Invalid channel_config setting: ${setting}`
        );
    }

    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE channel_config
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

// Delete a guild's leveling configuration
async function remove(guildId) {
    let connection;

    try {
        connection = await getConnection();
        const [result] = await connection.query(
            `
            DELETE FROM channel_config
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