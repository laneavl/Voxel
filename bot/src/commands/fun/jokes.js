const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { processJokesAIMessage } = require('../../utility/ai/ai_control');
const getEmbedColor = require('../../utility/database/get_embed_color');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jokes')
        .setDescription(`Aren't you a comedian? The Bot tells a joke`),
    usage: '',
    async execute(interaction, client) {
        const userId = interaction.member.user.id;
        const guildId = interaction.guild?.id;

        const responses = await processJokesAIMessage();

        const embedColor = await getEmbedColor(guildId, userId);

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .addFields({ name: 'Your Joke:', value: `${responses}` });

        await interaction.reply({ embeds: [embed] });
    }
}