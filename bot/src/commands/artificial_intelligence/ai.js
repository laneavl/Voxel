const { SlashCommandBuilder } = require('discord.js');
const { splitMessage, processAIMessage } = require('../../utility/ai/ai_control');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Talk to Voxel AI')
        .addStringOption(option =>
            option
                .setName('prompt')
                .setDescription('What you want to ask the AI (dw, it wont bite')
                .setRequired(true)
        ),
    usage: '',
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const userId = interaction.user.id;
        const username = interaction.user.username
        const guildname = interaction.guild.name;
        const guildId = interaction.guild ? interaction.guild.id : 'DM';

        await interaction.deferReply();

        try {
            const ai_msg_processor = await processAIMessage(prompt, userId, username, guildId, guildname);
            const chunks = await splitMessage(ai_msg_processor);

            await interaction.editReply(chunks[0]);

            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp(chunks[i]);
            }
        } catch (error) {
            console.error('AI ERROR:', error);
            if (error.status === 503) {
                await interaction.editReply(
                    'Gemini is currently experiencing high demand. Please try again later'
                );
            } else if (error.status === 429) {
                await interaction.editReply(
                    'Voxel has temporarily reached the AI request limit. Please try again later'
                );
            } else {
                await interaction.editReply(
                    `Sorry, I couldn't process that request.`
                );
            }
        }
    }
}