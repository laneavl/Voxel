const getConnection = require('../../functions/database/connectDatabase');

async function getEmbedColor(guildId, userId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                m.master_color,
                u.user_color
            FROM misc_config m
            LEFT JOIN user_config u
                ON u.guild_id = m.guild_id
                AND u.user_id = ?
            WHERE m.guild_id = ?
            `,
            [userId, guildId]
        );

        const config = rows[0];

        return (
            config?.user_color ||
            config?.master_color ||
            '#5865F2'
        );
    } finally {
        connection.release();
    }
}

module.exports = getEmbedColor;