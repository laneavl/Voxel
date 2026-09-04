const { processAIMessage, splitMessage } = require('./ai_control');
const getConnection = require('../../functions/database/connectDatabase')

async function aiDMMessage (message) {

    if (!message.guild) {
        const prompt = message.content.trim();
        if (!prompt) return;

        try {
            await message.channel.sendTyping();
            const responseText = await processAIMessage(
                prompt,
                message.author.id,
                message.author.username,
                'DM'
            );

            const chunks = splitMessage(responseText);
            for (const chunk of chunks) {
                await message.reply(chunk);
            };
        } catch (error) {
            console.error('AI DM ERROR:', error);

            /*
                     * Gemini temporarily unavailable.
                     */
            if (error.status === 503) {

                await message.reply(
                    'Gemini is currently experiencing high demand. Please try again in a moment.'
                );


                /*
                 * Gemini/API quota problems.
                 */
            } else if (error.status === 429) {

                await message.reply(
                    'Voxel has temporarily reached the AI request limit. Please try again later.'
                );


                /*
                 * Everything else.
                 */
            } else {

                await message.reply(
                    "Sorry, I couldn't process that request."
                );

            }
        }

        return;
    }
}

async function aiGuildMessage (message) {

    if (message.guild) {

        let connection;

        try {
            connection = await getConnection();

            const [cfgChannelsRows] = await connection.query(
                `SELECT ai_chat
                FROM channel_config
                WHERE guild_id = ?`,
                [message.guild.id]
            );

            const [cfgFeatureRows] = await connection.query(
                `SELECT ai_chat
                FROM feature_config
                WHERE guild_id = ?`,
                [message.guild.id]
            );

            connection.release();
            connection = null;

            const aiChatEnable = cfgFeatureRows[0]?.ai_chat;
            const aiChatChannel = cfgChannelsRows[0]?.ai_chat;

            if (
                aiChatEnable &&
                String(aiChatChannel) === String(message.channel.id)
            ) {
                const prompt = message.content.trim();

                if (!prompt) return;

                await message.channel.sendTyping();

                try {
                    const responseText = await processAIMessage(
                        prompt,
                        message.guild.name,
                        message.author.id,
                        message.author.username,
                        message.guild.id
                    );

                    const chunks = splitMessage(responseText);

                    for (const chunk of chunks) {
                        await message.reply(chunk);
                    }
                } catch (error) {
                    console.error('AI CHAT ERROR:', error);

                    /*
                             * Gemini temporarily unavailable.
                             */
                    if (error.status === 503) {

                        await message.reply(
                            'Gemini is currently experiencing high demand. Please try again in a moment.'
                        );


                        /*
                         * Gemini/API quota problems.
                         */
                    } else if (error.status === 429) {

                        await message.reply(
                            'Voxel has temporarily reached the AI request limit. Please try again later.'
                        );


                        /*
                         * Everything else.
                         */
                    } else {

                        await message.reply(
                            "Sorry, I couldn't process that request."
                        );

                    }
                }
            }
        } catch (error) {

            console.error(
                'AI CHANNEL CONFIG ERROR:',
                error
            );


            /*
             * Make sure the connection is released if
             * something went wrong.
             */
            if (connection) {
                connection.release();
            }
        }
    }
}

module.exports = {
    aiDMMessage,
    aiGuildMessage,
}