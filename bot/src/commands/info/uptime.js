const getEmbedColor = require('../../utility/database/get_embed_color');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatTime } = require('../../utility/database/formatters');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Retrive the total runtime of Voxel'),
    usage: '',
    async execute(interaction, client) {
        const userId = interaction.user.id;
        const guildId = interaction.guild?.id;

        const embedColor = await getEmbedColor(
            guildId,
            userId
        );

        const uptime = formatTime(process.uptime());

        try {
            const embed = new EmbedBuilder()
                .setTitle('Uptime')
                .addFields({ name: 'Uptime', value: `${uptime}`, inline: true })
                .setThumbnail(client.user?.displayAvatarURL())
                .setTimestamp()
                .setColor(embedColor);

            interaction.reply({ embeds: [embed] });
        } catch(error) {
            console.error(error);
        }
    }
}