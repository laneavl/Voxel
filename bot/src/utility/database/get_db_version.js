const getConnection = require('../../functions/database/connectDatabase');

async function getDBVersion() {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            'SELECT VERSION() AS version'
        );

        const databaseVersion = rows[0]?.version.replace(/-.*$/, '');

        return databaseVersion;
    } finally {
        connection.release();
    }
}

module.exports = getDBVersion;