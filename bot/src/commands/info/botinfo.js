const os = require('os');
const getEmbedColor = require('../../utility/database/get_embed_color');
const getDBVersion = require('../../utility/database/get_db_version');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const botStats = require('../../utility/database/get_bot_stats');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Get information about the bot'),
    usage: '',
    async execute(interaction, client) {
        const userId = interaction.user.id;
        const guildId = interaction.guild?.id;

        const embedColor = await getEmbedColor(
            guildId,
            userId
        );

        const stats = await botStats();
        const dbVersion = await getDBVersion();

        try {
            const embed = new EmbedBuilder()
                .setTitle('Bot Information')
                .addFields({ name: 'Runtime', value: `Node ${stats.runtimeVersion}`, inline: true })
                .addFields({ name: 'Language', value: `Node.js ${stats.nodeVersion}`, inline: true })
                .addFields({ name: 'Library', value: `${stats.libraryName} v${stats.libraryVersion}`, inline: true })
                .addFields({ name: 'Software Revision', value: `Client Version:\n**v${stats.botversion} *(${stats.buildversion})***\nNetwork Stack Version:\n**v${stats.websocket_version}**`, inline: true })
                .addFields({ name: 'Uptime', value: `${stats.uptime}`, inline: true })
                .addFields({ name: 'CPU Usage:', value: `${stats.formattedCpuUsage}`, inline: true })
                .addFields({ name: 'Memory Usage:', value: `${stats.usedMemory}/${stats.totalMemory}`, inline: true })
                .addFields({ name: 'Database Software', value: `MySQL`, inline: true })
                .addFields({ name: 'Database Version', value: `v${dbVersion}`, inline: true })
                .setThumbnail(client.user?.displayAvatarURL())
                .setTimestamp()
                .setColor(embedColor);

            interaction.reply({ embeds: [embed] });
        } catch(error) {
            console.error(error);
        }
    }
}