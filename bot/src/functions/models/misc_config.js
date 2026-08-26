const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS misc_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255),
        guild_name VARCHAR(255),
        auto_role VARCHAR(255) DEFAULT 0,
        bump_role VARCHAR(255) DEFAULT 0,
        master_color VARCHAR(255) DEFAULT 0
    )
`;

// Initialize the misc_config table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: misc_config');
    } catch (error) {
        console.error(
            'Failed to initialize misc_config:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get the miscellaneous configuration for a guild
async function get(guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM misc_config
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
            INSERT INTO misc_config
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
        'auto_role',
        'bump_role',
        'master_color'
    ];

    if (!allowedSettings.includes(setting)) {
        throw new Error(
            `Invalid misc_config setting: ${setting}`
        );
    }

    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE misc_config
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
            DELETE FROM misc_config
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