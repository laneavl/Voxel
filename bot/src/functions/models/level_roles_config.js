const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS level_roles_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(32) NOT NULL,
        guild_name VARCHAR(255),
        role_id VARCHAR(32) NOT NULL,
        levels INT NOT NULL DEFAULT 0,
        
        INDEX idx_level_roles_config_guild (guild_id),
        INDEX idx_level_roles_config_role (role_id)
    )
`;

// Initialize the level_roles_config table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: level_roles_config');
    } catch (error) {
        console.error(
            'Failed to initialize level_roles_config:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get all level roles for a guild
async function get(guildId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM level_roles_config
            WHERE guild_id = ?
            ORDER BY levels
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

// Get a specific level role
async function getRole(guildId, roleId) {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.query(
            `
            SELECT *
            FROM level_roles_config
            WHERE guild_id = ?
            AND role_id = ?
            LIMIT 1
            `,
            [guildId, roleId]
        );

        return rows[0] || null;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Add a level role
async function create(guildId, guildName, roleId, level) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO level_roles_config
            (
                guild_id,
                guild_name,
                role_id,
                levels
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                guildId,
                guildName,
                roleId,
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

// Update the level required for a role
async function update(guildId, roleId, level) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE level_roles_config
            SET levels = ?
            WHERE guild_id = ?
            AND role_id = ?
            `,
            [
                level,
                guildId,
                roleId
            ]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Remove a level role
async function remove(guildId, roleId) {
    let connection;

    try {
        connection = await getConnection();
        const [result] = await connection.query(
            `
            DELETE FROM level_roles_config
            WHERE guild_id = ?
            AND role_id = ?
            `,
            [guildId, roleId]
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
    getRole,
    create,
    update,
    remove
};
