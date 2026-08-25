const mysql = require('mysql2/promise');
const config = require('../../config/config.js');

const pool = mysql.createPool({
    host: config.database.mysqlHost,
    user: config.database.mysqlUser,
    password: config.database.mysqlPassword,
    database: config.database.mysqlDatabase,

    // Connection Pool Settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get a Connection from the MySQL connection pool.
async function getConnection() {
    return pool.getConnection();
}

// Check whether MySQL is responding.
async function checkDatabaseConnection() {
    try {
        await pool.query('SELECT 1');
        console.log(
            `MySQL Connection is active as of ${new Date().toLocaleString('en-US')}`,
        );
        return true;
    } catch (error) {
        console.error(
            'MySQL connection check failed:',
            error
        );
        return false;
    }
}

const databaseHealthCheck = setInterval (
    checkDatabaseConnection,
    60 * 60 * 1000
);

// Do Not Prevent Node From Shutting Down Because Of This Timer...
databaseHealthCheck.unref();

// Expose The Connection Function
// Additional Properties allow future database models
// to access the pool or health check without creating
// another connection layer.
getConnection.pool = pool;
getConnection.checkConnection = checkDatabaseConnection;

module.exports = getConnection;

