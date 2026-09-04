const getConnection = require('../../functions/database/connectDatabase');

async function getRankBackground(guildId, userId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                rank_card_background
            FROM user_config
            WHERE guild_id = ?
            AND user_id = ?
            `,
            [guildId, userId]
        );

        const config = rows[0];

        return (
            config?.rank_card_background
        );
    } finally {
        connection.release();
    }
}

module.exports = getRankBackground;