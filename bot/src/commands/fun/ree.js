const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ree')
        .setDescription('REEEEEEEEEEEEEEEE'),
    usage: '',
    async execute(interaction, client) {
        try {
            interaction.reply('REEEEEEEEEEEEEEEE\nhttps://tenor.com/view/ree-pepe-triggered-angry-ahhhh-gif-13627544');
        } catch(error) {
            console.error(error);
        }
    }
}