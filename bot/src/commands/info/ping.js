const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');
const getEmbedColor = require('../../utility/database/get_embed_color');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check Voxel's Latency"),
    usage: '',
    async execute(interaction, client) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const guildId = interaction.guild?.id;

        const embedColor = await getEmbedColor(
            guildId,
            userId
        );

        const apiLatency = client.ws.ping;
        const clientLatency =
            Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('Voxel Ping')
            .setDescription('Latency information for Voxel.')
            .addFields(
                {
                    name: 'Discord API',
                    value: `${apiLatency}ms`,
                    inline: true
                },
                {
                    name: 'Client',
                    value: `${clientLatency}ms`,
                    inline: true
                }
            );

        await interaction.editReply({
            embeds: [embed]
        });
    }
}