module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const ai = require('../../commands/artificial_intelligence/ai');
        const { aiDMMessage, aiGuildMessage } = require('../../utility/ai/ai_dm_message')
        const getConnection = require('../../functions/database/connectDatabase');

        try {
            console.log(
                'MESSAGE RECEIVED:',
                message.content,
                '| Guild:',
                message.guild?.id || 'DM'
            );

            if (message.author.bot) return;

            aiDMMessage(message);
            aiGuildMessage(message);
        } catch (error) {
            console.log(error);
        }
    }
}