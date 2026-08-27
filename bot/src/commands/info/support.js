const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');
const getEmbedColor = require('../../utility/database/get_embed_color');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Retrieves Discord Link for the Voxel Support Server"),
    usage: '',
    async execute(interaction, client) {
        const userId = interaction.user.id;
        const guildId = interaction.guild?.id;

        const embedColor = await getEmbedColor(
            guildId,
            userId
        );

        try {
            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('Voxel App Support Invite Link')
                .setDescription('Latency information for Voxel.')
                .addFields(
                    {
                        name: 'Server Name',
                        value: `Voxel Support Server`
                    },
                    {
                        name: 'Invite Link',
                        value: `https://dsc.gg/voxel-app`
                    }
                )
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({
                embeds: [embed]
            });
        } catch (error) {
            console.error(error);
        }
    },
};