const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS logger_channel_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(32) NOT NULL,
        guild_name VARCHAR(255),
        
        channel_create VARCHAR(32) DEFAULT 0,
        channel_delete VARCHAR(32) DEFAULT 0,
        channel_update VARCHAR(32) DEFAULT 0,
        
        guild_ban_add VARCHAR(32) DEFAULT 0,
        guild_ban_remove VARCHAR(32) DEFAULT 0,
        
        guild_emojis_create VARCHAR(32) DEFAULT 0,
        guild_emojis_delete VARCHAR(32) DEFAULT 0,
        guild_emojis_update VARCHAR(32) DEFAULT 0,
        
        guild_member_add VARCHAR(32) DEFAULT 0,
        guild_member_delete VARCHAR(32) DEFAULT 0,
        guild_member_kick VARCHAR(32) DEFAULT 0,
        guild_member_nick_update VARCHAR(32) DEFAULT 0,
        guild_member_update VARCHAR(32) DEFAULT 0,
        
        guild_role_create VARCHAR(32) DEFAULT 0,
        guild_role_delete VARCHAR(32) DEFAULT 0,
        guild_role_update VARCHAR(32) DEFAULT 0,
        
        guild_update VARCHAR(32) DEFAULT 0,
        
        message_delete VARCHAR(32) DEFAULT 0,
        message_delete_bulk VARCHAR(32) DEFAULT 0,
        message_update VARCHAR(32) DEFAULT 0,
        
        voice_channel_join VARCHAR(32) DEFAULT 0,
        voice_channel_leave VARCHAR(32) DEFAULT 0,
        voice_channel_switch VARCHAR(32) DEFAULT 0,
        voice_state_update VARCHAR(32) DEFAULT 0,
        
        UNIQUE KEY unique_guild_logger_channel (guild_id),
        INDEX idx_logger_channel_guild (guild_id)
    )
`;

// Initialize the logger_channel_config table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: logger_channel_config');
    } catch (error) {
        console.error(
            'Failed to initialize logger_channel_config:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get the logger settings for a guild
async function get(guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM logger_channel_config
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

// Create logger channel settings for a guild
async function create(guildId, guildName) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO logger_channel_config
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

// Update a logger channel setting
// Example: await set (guildId, 'message_delete', channelId);
async function set(guildId, setting, value) {
    const allowedSettings = [
        'channel_create',
        'channel_delete',
        'channel_update',
        'guild_ban_add',
        'guild_ban_remove',
        'guild_emojis_create',
        'guild_emojis_delete',
        'guild_emojis_update',
        'guild_member_add',
        'guild_member_delete',
        'guild_member_kick',
        'guild_member_nick_update',
        'guild_member_update',
        'guild_role_create',
        'guild_role_delete',
        'guild_role_update',
        'guild_update',
        'message_delete',
        'message_delete_bulk',
        'message_update',
        'voice_channel_join',
        'voice_channel_leave',
        'voice_channel_switch',
        'voice_state_update'
    ];

    if (!allowedSettings.includes(setting)) {
        throw new Error(
            `Invalid logger_channel_config setting: ${setting}`
        );
    }

    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE logger_channel_config
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

// Delete a guild's logger configuration
async function remove(guildId) {
    let connection;

    try {
        connection = await getConnection();
        const [result] = await connection.query(
            `
            DELETE FROM logger_channel_config
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