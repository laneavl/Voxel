const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS warnings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(32) NOT NULL,
        guild_name VARCHAR(255),
        warning_id VARCHAR(255),
        user_id VARCHAR(32),
        user_name VARCHAR(255),
        mod_name VARCHAR(255),
        reason TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_warnings_guild (guild_id),
        INDEX idx_warnings_user (guild_id, user_name),
        INDEX idx_warnings_id (guild_id, warning_id)
    )
`;

// Initialize the warnings table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: warnings');
    } catch (error) {
        console.error(
            'Failed to initialize warnings:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get warnings for a guild.
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
            FROM warnings
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

// Get Warnings for a specific user.
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
            FROM warnings
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

// Add a warning
async function create({
    guildId,
    guildName,
    warningId,
    userId,
    username,
    modname,
    reason = 0
}) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO warnings
            (
                guild_id,
                guild_name,
                warning_id,
                user_id,
                user_name,
                mod_name,
                reason
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                guildId,
                guildName,
                warningId,
                userId,
                username,
                modname,
                reason
            ]
        );

        return result.insertId
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function getById(guildId, warningId) {
    let connection;

    try{
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM warnings
            WHERE guild_id = ?
            AND warning_id = ?
            LIMIT 1
            `,
            [guildId, warningId]
        );

        return rows[0] || null;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

async function remove(guildId, warningId) {
    let connection;

    try{
        connection = await getConnection();

        const [result] = await connection.query(
            `
            DELETE FROM warnings
            WHERE guild_id = ?
            AND warning_id = ?
            `,
            [guildId, warningId]
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
    getUser,
    create,
    getById,
    remove
};