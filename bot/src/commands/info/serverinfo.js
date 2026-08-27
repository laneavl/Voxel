const getEmbedColor = require('../../utility/database/get_embed_color');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get Information On The Server'),
    usage: '',
    async execute(interaction, client) {
        const guild = interaction.guild;
        const userId = interaction.user.id;
        const guildId = interaction.guild?.id;

        const embedColor = await getEmbedColor(
            guildId,
            userId
        );

        try {
            await interaction.guild?.members.fetch(interaction.guild?.ownerId).then(async (owner) => {
                const ownerTag = owner.user ? owner.user.tag : 'Unknown';
                const created = interaction.guild?.createdAt.toLocaleString();
                const channels = interaction.guild?.channels.cache.size;
                const roles = interaction.guild?.roles.cache.size;
                const emojis = interaction.guild?.emojis.cache.size;
                const members = interaction.guild?.memberCount;
                const bots = interaction.guild?.members.cache.filter(member => member.user.bot).size;

                const embed = new EmbedBuilder()
                    .setTitle(`${guild.name} - Server Information`)
                    .addFields({ name: 'Owner', value: ownerTag, inline: true })
                    .addFields({ name: 'Created', value: created, inline: true })
                    .addFields({ name: 'Channels', value: `${channels}`, inline: true })
                    .addFields({ name: 'Roles', value: `${roles}`, inline: true })
                    .addFields({ name: 'Emojis', value: `${emojis}`, inline: true })
                    .addFields({ name: 'Members', value: `${members} (${bots} bots)`, inline: true })
                    .setThumbnail(client.user?.displayAvatarURL())
                    .setTimestamp()
                    .setColor(embedColor);

                interaction.reply({ embeds: [embed] });
            })
        } catch(error) {
            console.error(error);
        }
    }
}