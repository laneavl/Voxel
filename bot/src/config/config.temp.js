module.exports = {
    bot: {
        token: "YOUR_BOT_TOKEN",
        clientId: "YOUR_CLIENT_ID",
        status: {
            status: "<insert here>", // online, idle, dnd, invisible
            type: "<insert here>", // playing, streaming, listening, watching, competing
        },
        rapidApiKey: "YOUR_RAPIDAPI_KEY",
        urbanApiHost: "YOUR_URBAN_API_HOST",
        redditApiHost: "YOUR_REDDIT_API_HOST",
        openAiApiKey: "YOUR_OPENAI_API_KEY",
        geminiApiKey: "YOUR_GEMINI_API_KEY",
        webhookUrl: "YOUR_WEBHOOK_URL",
    },

    database: {
        mysqlHost: "YOUR_MYSQL_HOST",
        mysqlUser: "YOUR_MYSQL_USER",
        mysqlPassword: "YOUR_MYSQL_PASSWORD",
        mysqlDatabase: "YOUR_MYSQL_DATABASE",
        websocket_version: "YOUR_WEBSOCKET_VERSION", // (this is for the "botinfo" command, you can leave it as is if you don't want to change it, it will default to "1.0.0" if not set)
    },

    dashboard: {
        client_secret: 'YOUR_CLIENT_SECRET',
        redirect_uri: 'YOUR_REDIRECT_URI',
        session_secret: 'YOUR_SESSION_SECRET'
    },

    server: {
        botApiUrl: "YOUR_BOT_API_URL",
        internalApiKey: "YOUR_INTERNAL_API_KEY"
    },

    plugins: {
        funfact: {
            source: 'insert local file path here', // e.g. './plugins/funfact.json'
        },
        rss: {
            source: 'insert local file path here', // e.g. './plugins/rss.json'
        },
        roasts: {
            source: 'insert local file path here', // e.g. './plugins/roasts.json'
        },
        subreddits: {
            source: 'insert local file path here', // e.g. './plugins/subreddits.json'
        },
        eightball: {
            source: 'insert local file path here', // e.g. './plugins/eightball.json'
        },
        jokes: {
            source: 'insert local file path here', // e.g. './plugins/jokes.json'
        }
    },
    version: {
        version: "1.0.0" // (this is for the "botinfo" command, you can leave it as is if you don't want to change it, it will default to "1.0.0" if not set)
    },
    github: {
        repo_owner: "YOUR_GITHUB_REPO_OWNER",
        repo_name: "YOUR_GITHUB_REPO_NAME",
        branch_name: "YOUR_GITHUB_BRANCH_NAME"
    }
};