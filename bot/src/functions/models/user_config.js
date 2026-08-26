const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS user_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(32),
        guild_name VARCHAR(255),
        user_id VARCHAR(32) NOT NULL,
        user_name VARCHAR(255),
        mention_on_level_up BOOLEAN DEFAULT 1,
        user_color VARCHAR(255) DEFAULT NULL,
        rank_card_background VARCHAR(255) DEFAULT NULL,
        
        UNIQUE KEY unique_user_config (
            guild_id,
            user_id
        ),
        
        INDEX idx_user_config_user (user_id)
    )
`;

// Initialize the user_config table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: user_config');
    } catch (error) {
        console.error(
            'Failed to initialize user_config:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get a user's configuration.
async function get(userId, guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM user_config
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

// Create a user's configuration.
async function create(userId, guildId, username, guildname) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO user_config
            (
                guild_id,
                guild_name,
                user_id,
                user_name
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                guildId,
                guildName,
                userId,
                username
            ]
        );

        return result.insertId;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Update a user's configuration.
async function update(userId, guildId, {
    usercolor, mentionOnLevelUp, rankCardBackground, username, guildname
}) {
    const fields = [];
    const values = [];

    if (usercolor !== undefined) {
        fields.push('user_color = ?');
        values.push(usercolor);
    }

    if (mentionOnLevelUp !== undefined) {
        fields.push('mention_on_level_up = ?');
        values.push(mentionOnLevelUp ? 1 : 0);
    }

    if (rankCardBackground !== undefined) {
        fields.push('rank_card_background = ?');
        values.push(rankCardBackground ? 1 : 0);
    }

    if (username !== undefined) {
        fields.push('username = ?');
        values.push(username);
    }

    if (fields.length === 0) {
        return 0;
    }

    let connection;

    try{
        connection = await getConnection();
        values.push(userId, guildId);

        const [result] = await connection.query(
            `
            UPDATE user_config
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

// Remove a user's configuration.
async function remove(userId, guildId) {
    let connection;

    try {
        connection = await getConnection();
        const [result] = await connection.query(
            `
            DELETE FROM user_config
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

module.exports = {
    initialize,
    get,
    create,
    update,
    remove
};