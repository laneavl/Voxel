const getConnection = require('../../functions/database/connectDatabase');

async function getRapidAPIKey(guildId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                rapidApiKey
            FROM bot_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        const config = rows[0];

        return (
            config?.rapidApiKey
        );
    } finally {
        connection.release();
    }
}

async function getUrbanApiHost(guildId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                urbanApiHost
            FROM bot_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        const config = rows[0];

        return (
            config?.urbanApiHost
        );
    } finally {
        connection.release();
    }
}

async function getRedditApiHost(guildId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                redditApiHost
            FROM bot_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        const config = rows[0];

        return (
            config?.redditApiHost
        );
    } finally {
        connection.release();
    }
}

async function getOpenAiApiKey(guildId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                openAiApiKey
            FROM bot_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        const config = rows[0];

        return (
            config?.openAiApiKey
        );
    } finally {
        connection.release();
    }
}

async function getWebhookURL(guildId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                webhookURL
            FROM bot_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        const config = rows[0];

        return (
            config?.webhookURL
        );
    } finally {
        connection.release();
    }
}

async function getEightballURL(guildId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                eightballURL
            FROM bot_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        const config = rows[0];

        return (
            config?.eightballURL
        );
    } finally {
        connection.release();
    }
}

async function getSubredditsURL(guildId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                subredditsURL
            FROM bot_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        const config = rows[0];

        return (
            config?.subredditsURL
        );
    } finally {
        connection.release();
    }
}

async function getRSSURL(guildId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                rssURL
            FROM bot_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        const config = rows[0];

        return (
            config?.rssURL
        );
    } finally {
        connection.release();
    }
}

async function getFunFactURL(guildId) {
    const connection = await getConnection();

    try {
        const [rows] = await connection.query(
            `
            SELECT
                funfactURL
            FROM bot_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        const config = rows[0];

        return (
            config?.funfactURL
        );
    } finally {
        connection.release();
    }
}

module.exports = {
    getRapidAPIKey,
    getUrbanApiHost,
    getRedditApiHost,
    getOpenAiApiKey,
    getWebhookURL,
    getEightballURL,
    getSubredditsURL,
    getRSSURL,
    getFunFactURL

};