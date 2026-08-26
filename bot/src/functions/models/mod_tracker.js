const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS mod_tracker (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(32) NOT NULL,
        guild_name VARCHAR(255),
        user_id VARCHAR(32),
        user_name VARCHAR(255),
        mod_name VARCHAR(255),
        mod_event VARCHAR(255),
        reason VARCHAR(255) DEFAULT 0,
        duration VARCHAR(255) DEFAULT 0,
        number_of_messages VARCHAR(255) DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_mod_tracker_guild (guild_id),
        INDEX idx_mod_tracker_user (guild_id, user_name),
        INDEX idx_mod_tracker_timestamp (guild_id, timestamp)
    )
`;

// Initialize the mod_tracker table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: mod_tracker');
    } catch (error) {
        console.error(
            'Failed to initialize mod_tracker:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get Moderation History for a guild.
async function get(guildId, limit = 50) {
    let connection;

    try {
        connection = await getConnection();
        const safeLimit = Math.max(
            1,
            Math.min(Number(limit) || 50, 100)
        );

        const [rows] = await connection.query(
            `
            SELECT *
            FROM mod_tracker
            WHERE guild_id = ?
            ORDER BY timestamp DESC
            LIMIT ${safeLimit}
            `,
            [guildId]
        );

        return rows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get Moderation History for a user.
async function getUser(guildId, username, limit = 50) {
    let connection;

    try{
        connection = await getConnection();
        const safeLimit = Math.max(
            1,
            Math.min(Number(limit) || 50, 100)
        );

        const [rows] = await connection.query(
            `
            SELECT *
            FROM mod_tracker
            WHERE guild_id = ?
            AND user_name = ?
            ORDER BY timestamp DESC
            LIMIT ${safeLimit}
            `,
            [guildId, username]
        );

        return rows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Add a moderation event
async function create({
    guildId,
    guildName,
    username,
    modname,
    modevent,
    reason = 0,
    duration = 0,
    numberOfMessages = 0
}) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            INSERT INTO mod_tracker
            (
                guild_id,
                guild_name,
                user_id,
                user_name,
                mod_name,
                mod_event,
                reason,
                duration,
                number_of_messages
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                guildId,
                guildName,
                username,
                modname,
                modevent,
                reason,
                duration,
                numberOfMessages
            ]
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
    getUser,
    create
};