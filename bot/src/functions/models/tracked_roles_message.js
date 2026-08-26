const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS tracked_roles_message (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(32) NOT NULL,
        guild_name VARCHAR(255),
        channel_id VARCHAR(32) NOT NULL,
        message_id VARCHAR(32) NOT NULL,
        
        UNIQUE KEY unique_tracked_message (
            guild_id,
            channel_id,
            message_id
        ),
        
        INDEX idx_tracked_roles_guild (guild_id)
    )
`;

// Initialize the tracked_roles_message table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: tracked_roles_message');
    } catch (error) {
        console.error(
            'Failed to initialize tracked_roles_message:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get the tracked role message for a guild.
async function get(guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM tracked_roles_message
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

// Create or replace the tracked role message.
async function set(guildId, guildName, channelId, messageId) {
    let connection;

    try{
        connection = await getConnection();

        await connection.query(
            `
            DELETE FROM tracked_roles_message
            WHERE guild_id = ?
            `,
            [guildId]
        );

        const [result] = await connection.query(
            `
            INSERT INTO tracked_roles_message
            (
             guild_id,
             guild_name,
             channel_id,
             message_id
            )
            VALUES (?, ?, ?, ?)
            `,
            [guildId, guildName, channelId, messageId]
        );

        return result.insertId;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Remove the tracked role message.
async function remove(guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            DELETE FROM tracked_roles_message
            WHERE guild_id = ?
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

module.exports = {
    initialize,
    get,
    set,
    remove
};