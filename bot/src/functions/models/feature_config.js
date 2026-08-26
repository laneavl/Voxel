const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS feature_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255),
        guild_name VARCHAR(255),
        ai_chat BOOLEAN DEFAULT 0,
        auto_role BOOLEAN DEFAULT 0,
        bump BOOLEAN DEFAULT 0,
        economy BOOLEAN DEFAULT 0,
        fun_fact BOOLEAN DEFAULT 0,
        greeter BOOLEAN DEFAULT 0,
        leaver BOOLEAN DEFAULT 0,
        leveling BOOLEAN DEFAULT 0,
        moderation BOOLEAN DEFAULT 0,
        modmail BOOLEAN DEFAULT 0,
        music BOOLEAN DEFAULT 0,
        reddit BOOLEAN DEFAULT 0,
        rss BOOLEAN DEFAULT 0,
        self_ping BOOLEAN DEFAULT 0,
        sudo BOOLEAN DEFAULT 0
    )
`;

// Initialize the feature_config table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: feature_config');
    } catch (error) {
        console.error(
            'Failed to initialize feature_config:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get the feature configuration for a guild
async function get(guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM feature_config
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

// Create a feature configuration row for a guild
async function create(guildId, guildName) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO feature_config
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

// Update a feature configuration value
// Example: await set (guildId, 'auto_role', true);
async function set(guildId, setting, value) {
    const allowedSettings = [
        'ai_chat',
        'auto_role',
        'bump',
        'economy',
        'fun_fact',
        'greeter',
        'leaver',
        'leveling',
        'moderation',
        'modmail',
        'music',
        'reddit',
        'rss',
        'self_ping',
        'sudo'
    ];

    if (!allowedSettings.includes(setting)) {
        throw new Error(
            `Invalid feature_config setting: ${setting}`
        );
    }

    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE feature_config
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

// Delete a guild's feature configuration
async function remove(guildId) {
    let connection;

    try {
        connection = await getConnection();
        const [result] = await connection.query(
            `
            DELETE FROM feature_config
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