const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bigtext')
        .setDescription('Converts Text into H1')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('The Text To Input')
                .setRequired(true)),
    usage: `<Text To Input>`,
    async execute(interaction, client) {
        const big_text = interaction.options.getString('text');

        return interaction.reply(`# ${big_text}`);
    },
};