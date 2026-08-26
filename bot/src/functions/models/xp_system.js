const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS xp_system (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(32) NOT NULL,
        guild_name VARCHAR(255),
        user_id VARCHAR(32) NOT NULL,
        user_name VARCHAR(255),
        xp INT DEFAULT 0,
        total_xp INT DEFAULT 0,
        level INT DEFAULT 0,
        
        UNIQUE KEY unique_user_guild (guild_id, user_id),
        INDEX idx_level_guild (guild_id),
        INDEX idx_level_user (user_id)
    )
`;

// Initialize the xp_system table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: xp_system');
    } catch (error) {
        console.error(
            'Failed to initialize xp_system:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get a user's xp_system record.
async function get(userId, guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM xp_system
            WHERE user_id = ?
            AND guild_id = ?
            LIMIT 1
            `,
            [userId, guildId]
        );

        return rows[0] || null;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Create a xp_system record for a user.
async function create(
    userId,
    guildId,
    username,
    guildname,
    xp = 0,
    totalxp = 0,
    level = 0
) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO xp_system
            (
                guild_id,
                guild_name,
                user_id,
                user_name,
                xp,
                total_xp,
                level
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                guildId,
                username,
                guildname,
                xp,
                totalxp,
                level
            ]
        );

        return result.insertId;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Update a user's level data
async function update(userId, guildId, {
    xp,
    totalxp,
    level,
    username,
    guildname
}) {
    let connection;
    try {
        connection = await getConnection();

        const fields = [];
        const values = [];

        if (xp !== undefined) {
            fields.push('xp = ?');
            values.push(xp);
        }

        if (totalxp !== undefined) {
            fields.push('total_xp = ?');
            values.push(totalxp);
        }

        if (level !== undefined) {
            fields.push('level = ?');
            values.push(level);
        }

        if (username !== undefined) {
            fields.push('username = ?');
            values.push(username);
        }

        if (guildname !== undefined) {
            fields.push('guild_name = ?');
            values.push(guildname);
        }

        if (fields.length === 0) {
            return 0;
        }

        values.push(userId, guildId);

        const [result] = await connection.query(
            `
            UPDATE xp_system
            SET ${fields.join(', ')}
            WHERE user_id = ?
            AND guild_id = ?
            `,
            values
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Delete a user's level record.
async function remove(userId, guildId) {
    let connection;
    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            DELETE FROM xp_system
            WHERE user_id = ?
            AND guild_id = ?
            `,
            [userId, guildId]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get the leaderboard for a guild.
async function leaderboard(guildId) {
    let connection;
    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM xp_system
            WHERE guild_id = ?
            ORDER BY total_xp DESC
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

module.exports = {
    initialize,
    get,
    create,
    update,
    remove,
    leaderboard
};