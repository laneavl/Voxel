const { Webhook } = require('discord-webhook-node');
const { getWebhookURL, getOpenAiApiKey} = require('../../utility/database/get_bot_config');
const OpenAI = require("openai");

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        const startTimestamp = Date.now();

        console.log(
            `${client.user.username} is Starting`
        );

        const endTimestamp = Date.now();
        const elapsed = endTimestamp - startTimestamp;

        console.log(
            `${client.user.username} Finished Starting at ` +
            `${new Date().toLocaleString()} (${elapsed} ms)`
        );

        console.log(
            '-----------------------------------------------------------'
        );

        const webhookURL = await getWebhookURL(client);
        const url = webhookURL;

        if (url) {
            try {
                const hook = new Webhook(url);

                hook.setUsername('Voxel Logs');

                const webhookMessage =
                    `${client.user.username} Finished Starting at ` +
                    `${new Date().toLocaleString()} (${elapsed} ms)\n` +
                    `The Current Ping Time is As Follows:\n` +
                    `API Latency: ${client.ws.ping}ms`;
                
                console.log(webhookMessage);

                await hook.info(webhookMessage);
            } catch (error) {
                console.error('Error occurred while sending webhook message:', error);
            }
        }
    }
}