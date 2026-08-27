const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config/config')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('github')
        .setDescription(`Retrieve GitHub Link`),
    usage: '',
    async execute(interaction) {
        const author = config.github.repo_owner;
        const repo = config.github.repo_name;
        const branch = config.github.branch_name;

        try {
            interaction.reply(`https://github.com/${author}/${repo}/tree/${branch}`);
        } catch (error) {
            console.error(error);
        }
    }
}