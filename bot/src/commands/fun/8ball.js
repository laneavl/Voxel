const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const getEmbedColor = require('../../utility/database/get_embed_color');
const { getEightballURL } = require('../../utility/database/get_bot_config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Get Your Questions Answered By The Almighty 8 Ball')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('Your Question to the Almighty 8 Ball')),
    usage: `<question>`,
    async execute(interaction){
        const question = interaction.options.getString('question');
        const userId = interaction.member.user.id;
        const guildId = interaction.guild.id;

        const eightBallSource = await getEightballURL(guildId);

        if (!question) {
            return interaction.reply('Please ask a question.');
        }

        const embedColor = await getEmbedColor(
            guildId,
            userId
        );

        const response = await fetch(eightBallSource);
        if (!response.ok) {
            throw new Error(
                `8ball Source returned HTTP ${response.status}`
            );
        }
        const responses = await response.json();

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .addFields({ name: 'Question', value: `${question}` })
            .addFields({ name: '8 Ball Response', value: `${randomResponse || 'Could Not Connect To 8Ball Service'}` });

        await interaction.reply({ embeds: [embed] });
    },
};