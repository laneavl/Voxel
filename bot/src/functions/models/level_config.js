const getConnection = require('../database/connectDatabase');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS level_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR (255),
        guild_name VARCHAR(255),
        min_xp INT DEFAULT 10,
        max_xp INT DEFAULT 25,
        leaderboard_style VARCHAR(255),
        leaderboard_background VARCHAR(255),
        rank_card_background VARCHAR(255)
    )
`;

// Initialize the level_config table
async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: level_config');
    } catch (error) {
        console.error(
            'Failed to initialize level_config:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get the leveling configuration for a guild
async function get(guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM level_config
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

// Create a leveling configuration row for a guild
async function create(guildId, guildName) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO level_config
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
        'guild_name',
        'min_xp',
        'max_xp',
        'leaderboard_style',
        'leaderboard_background',
        'rank_card_background'
    ];

    if (!allowedSettings.includes(setting)) {
        throw new Error(
            `Invalid level_config setting: ${setting}`
        );
    }

    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE level_config
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
            DELETE FROM level_config
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
}