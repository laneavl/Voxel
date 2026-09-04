const { SlashCommandBuilder } = require('discord.js');
const { processRoastAIMessage } = require('../../utility/ai/ai_control');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roast')
        .setDescription('Roast People')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The User You Want To Roast')
        ),
    usage: `<user> (optional)`,
    async execute(interaction, client) {
        try {
            let user = interaction.options.getUser('user');
            const self_mention = `<@${interaction.user.id}>`;

            const responses = await processRoastAIMessage();

            if (!user) {
                return interaction.reply(`${self_mention}, ${responses}`);
            } else {
                return interaction.reply(`<@${user.id}>, ${responses}`);
            }
        } catch (error) {
            console.error(error);
        }
    }

}