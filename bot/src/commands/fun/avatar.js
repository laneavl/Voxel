const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const getEmbedColor = require('../../utility/database/get_embed_color');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Retrieve User\'s Avatar')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The User You Want to Grab the Avatar Of')
                .setRequired(true)),
    usage: `<user>`,
    async execute(interaction, client) {
        try {
            let user = interaction.options.getUser('user');
            const userId = interaction.member.user.id;
            const guildId = interaction.options.guild?.id;

            if (!user) {
                return interaction.reply('Could not find user.');
            }

            const embedColor = await getEmbedColor(
                guildId,
                userId
            );

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(`${user.tag}'s Avatar`)
                .addFields({ name: '**Link As**', value: `[png](${user.avatarURL({ format: 'png' })}) | [jpg](${user.avatarURL({ format: 'jpg'})}) | [webp](${user.avatarURL({ format: 'png', dynamic: false, size: 1024 })})`})
                .setImage(user.avatarURL({ format: 'png', dynamic: false, size: 1024 }))
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } catch(error) {
            console.error(error);
        }
    }

}