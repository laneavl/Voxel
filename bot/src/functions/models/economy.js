const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS economy (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(32) NOT NULL,
        guild_name VARCHAR(255),
        user_id VARCHAR(32),
        user_name VARCHAR(255),
        wallet INT DEFAULT 0,
        bank INT DEFAULT 0,
        last_daily DATETIME NULL
    )
`;

// Initialize the economy table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: economy');
    } catch (error) {
        console.error(
            'Failed to initialize economy:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Get a user's economy record.
async function get(guildId, userId) {
    let connection;

    try {
        connection = await getConnection();

        const [rows] = await connection.query(
            `
            SELECT *
            FROM economy
            WHERE guild_id = ?
            AND user_id = ?
            LIMIT 1
            `,
            [guildId, userId]
        );

        return rows[0] || null;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Create an economy record for a user.
async function create(
    guildId,
    guildName,
    userId,
    username,
    wallet = 0,
    bank = 0
) {
    let connection;

    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            INSERT INTO economy
            (
                guild_id,
                guild_name,
                user_id,
                user_name,
                wallet,
                bank
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                guildId,
                guildName,
                userId,
                username,
                wallet,
                bank
            ]
        );

        return result.insertId;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Update a user's wallet
async function setWallet(guildId, userId, amount) {
    let connection;
    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE economy
            SET wallet = ?
            WHERE guild_id = ?
            AND user_id = ?
            `,
            [amount, guildId, userId]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Update a user's bank balance
async function setBank(guildId, userId, amount) {
    let connection;
    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE economy
            SET bank = ?
            WHERE guild_id = ?
            AND user_id = ?
            `,
            [amount, guildId, userId]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Update a user's wallet and bank balances.
async function setBalances(guildId, userId, wallet, bank) {
    let connection;
    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE economy
            SET wallet = ?,
                bank = ?
            WHERE guild_id = ?
            AND user_id = ?
            `,
            [
                wallet,
                bank,
                guildId,
                userId
            ]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Update a user's wallet and bank balances.
async function setLastDaily(guildId, userId, timestamp = new Date()) {
    let connection;
    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE economy
            SET last_daily = ?
            WHERE guild_id = ?
            AND user_id = ?
            `,
            [
                timestamp,
                guildId,
                userId
            ]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Update a user's username.
async function setUsername(guildId, userId, username) {
    let connection;
    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            UPDATE economy
            SET user_name = ?
            WHERE guild_id = ?
            AND user_id = ?
            `,
            [
                username,
                guildId,
                userId
            ]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Delete a user's economy record.
async function remove(guildId, userId) {
    let connection;
    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            DELETE FROM economy
            WHERE guild_id = ?
            AND user_id = ?
            `,
            [
                guildId,
                userId
            ]
        );

        return result.affectedRows;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Delete all economy records for a guild.
async function removeGuild(guildId) {
    let connection;
    try {
        connection = await getConnection();

        const [result] = await connection.query(
            `
            DELETE FROM economy
            WHERE guild_id = ?
            `,
            [
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

module.exports = {
    initialize,
    get,
    create,
    setWallet,
    setBank,
    setBalances,
    setLastDaily,
    setUsername,
    remove,
    removeGuild
};