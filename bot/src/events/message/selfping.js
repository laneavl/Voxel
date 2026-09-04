const { PermissionFlagsBits } = require('discord.js');
const feature_config = require('../../functions/models/feature_config');

module.exports = {
    name: 'messageCreate',
    once: false,

    async execute(message, client) {
        try {
            if (!message.guild || message.author.bot) return;

            const enableConfig = await feature_config.get(message.guild.id);

            if (!enableConfig || enableConfig.self_ping !== 1) {
                return;
            }

            if (!message.mentions.has(client.user)) {
                return;
            }

            const permissions = message.channel.permissionsFor(client.user);
            if (!permissions?.has(PermissionFlagsBits.SendMessages)) {
                return;
            }

            await message.channel.send(`I was pinged by<@${message.author.id}>! Use \`/help\` for the list of commands!`)
        } catch (error) {
            console.error('Error in selfping event:', error);
        }
    }
}