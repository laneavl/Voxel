const getConnection = require('../database/connectDatabase.js');

const TABLE_SCHEMA = `
    CREATE TABLE IF NOT EXISTS bump_leaderboard (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guild_id VARCHAR(255),
        guild_name VARCHAR(255),
        user_id VARCHAR(255),
        user_name VARCHAR(255),
        total_bumps INT
    )
`;

// Initialize the bump_leaderboard table

async function initialize() {
    let connection;

    try {
        connection = await getConnection();
        await connection.query(TABLE_SCHEMA);
        console.log('Database table ready: bump_leaderboard');
    } catch (error) {
        console.error(
            'Failed to initialize bump_leaderboard:',
            error
        );

        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    initialize
};