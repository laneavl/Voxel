const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS member_roles_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(32) NOT NULL,
        guild_name VARCHAR(255),
        username VARCHAR(255),
        user_id VARCHAR(32) NOT NULL,
        role_id INT NOT NULL DEFAULT 0,
        
        INDEX idx_member_roles_config_user (guild_id, user_id),
        INDEX idx_member_roles_config_role (guild_id, role_id)
    )
`;

// Initialize the member_roles_config table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: member_roles_config');
    } catch (error) {
        console.error(
            'Failed to initialize member_roles_config:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get all tracked roles for a user
async function get(userId, guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM member_roles_config
            WHERE user_id = ?
            AND guild_id = ?
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

// Add a level role
async function create(guildId, guildName, username, userId, roleId) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO member_roles_config
            (
                guild_id,
                guild_name,
                username,
                user_id,
                role_id
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                guildId,
                guildName,
                roleId,
                level,
                roleId
            ]
        );

        return result.insertId;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Remove a tracked role from a user
async function remove(userId, guildId, roleId) {
    let connection;
    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            DELETE FROM member_roles_config
            WHERE user_id = ?
            AND guild_id = ?
            AND role_id = ?
            `,
            [userId, guildId, roleId]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Remove all tracked roles for a user
async function removeUser(userId, guildId) {
    let connection;

    try {
        connection = await getConnection();
        const [result] = await connection.query(
            `
            DELETE FROM member_roles_config
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
    remove,
    removeUser
};