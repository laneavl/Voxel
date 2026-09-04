const { SlashCommandBuilder } = require('discord.js');
const getConnection = require('../../functions/database/connectDatabase')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-clear')
        .setDescription('Clear your Voxel AI Conversation History'),
    usage: '',

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild ? interaction.guild.id : 'DM';

        let connection;

        try {
            connection = await getConnection();
            const [result] = await connection.query (
                `DELETE FROM ai_conversations
                 WHERE guild_id = ?
                 AND user_id = ?`,
                [guildId, userId]
            );

            connection.release();
            connection = null;

            if (result.affectedRows === 0) {
                await interaction.reply({
                    content: 'You don\'t have any AI conversation history to clear.',
                    ephemeral: true
                });

                return;
            }

            await interaction.reply({
                content: 'Your Voxel AI Conversation History has been cleared.',
                ephemeral: true
            });
        } catch (error) {
            console.error('AI CLEAR ERROR:', error);

            if (connection) {
                connection.release();
            }

            await interaction.reply({
                content: 'I couldn\'t clear your AI conversation history.',
                ephemeral: true
            });
        }
    },
};