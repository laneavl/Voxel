const fetch = require('node-fetch');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config/config');
const getEmbedColor = require('../../utility/database/get_embed_color');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urban')
        .setDescription('Searched for a Word From the Urban Dictionary')
        .addStringOption(option =>
            option
                .setName('term')
                .setDescription('The Dictionary Term You Want to Look Up')
                .setRequired(true)
        ),
    usage: '<dictionary term>',
    async execute(interaction) {
        const userId = interaction.member.user.id;
        const guildId = interaction.guild?.id;

        await interaction.deferReply();

        try {
            const term = interaction.options.getString('term');
            const url = `https://urban-dictionary7.p.rapidapi.com/v0/define?term=${term}`;
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': config.bot.rapidApiKey,
                    'X-RapidAPI-Host': config.bot.urbanApiHost,
                    'Content-Type': 'application/json'
                }
            };

            const embedColor = await getEmbedColor(userId, guildId);

            const response = await fetch(url, options);
            const result = await response.json();

            if (result.list) {
                let definition = result.list[0].definition;

                if (definition.length > 1000) {
                    definition = definition.slice(0, 1000) + '...';
                }

                const embed = new EmbedBuilder()
                    .setTitle(`Urban Dictionary: ${term}`)
                    .setColor(embedColor)
                    .addFields({ name: 'Definition', value: definition || 'No definition available' })
                    .addFields({ name: 'Example', value: result.list[0].example || 'No example available' });

                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply('No definition found for the specified term.');
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred while fetching the definition.');
        }
    }
}