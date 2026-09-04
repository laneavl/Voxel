const { EmbedBuilder } = require('discord.js');
const getEmbedColor = require('../../utility/database/get_embed_color');

module.exports = {
    name: 'messageCreate',
    once: false,

    async execute (message, client) {
        try {
            if (message.author.bot || !message.guild) return;
            const embedColor = await getEmbedColor(message.guild.id);

            const match = message.content.match(
                /discord\.com\/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)/
            );

            if (!match) return;

            const [, guildId, channelId, messageId] = match;
            if (guildId !== message.guild.id) return;
            const channel = await client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) return;
            const fetchedMessage = await channel.messages.fetch(messageId);

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('Referenced Message')
                .setURL(fetchedMessage.url)
                .setAuthor({
                    name: fetchedMessage.author.username,
                    iconURL: fetchedMessage.author.displayAvatarURL()
                })
                .setDescription(
                    fetchedMessage.content || '*No message content*'
                )
                .setTimestamp();

            await message.channel.send({
                embeds: [embed]
            });
        } catch (error) {
            console.error('Error in messageLink event:', error);
        }
    }
}