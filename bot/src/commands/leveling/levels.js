const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config/config')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levels')
        .setDescription('Get a link to the leaderboard'),
    usage: '',
    async execute(interaction) {
        const dashboardLink = config.dashboard.global_url;
        await interaction.reply(
            `Here You Go:\n${dashboardLink}/leaderboard`
        )
    }
}