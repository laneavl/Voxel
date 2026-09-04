const fetch = require('node-fetch');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const getEmbedColor = require('../../utility/database/get_embed_color');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ip')
        .setDescription('Return IP Information')
        .addStringOption(option =>
            option
                .setName('ip_address')
                .setDescription('The IP Address to Input')
                .setRequired(true)),
    usage: `<IP Address>`,
    async execute(interaction) {
        try {
            const userId = interaction.member.user.id;
            const guildId = interaction.guild?.id;

            const ip = interaction.options.getString('ip_address');
            if (!ip) {
                console.log('Please provide an IP Address');
                return;
            }

            const embedColor = await getEmbedColor(guildId, userId);

            try {
                const url = `https://ipinfo.io/${ip}/geo`;
                const ip_return = await fetch(url);
                const info = await ip_return.json();

                const embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setTitle(`Information for ${info.ip}`)
                    .setDescription(`**LOCATION:**`)
                    .addFields(
                        { name: '**CITY:**', value: `**${info.city}**`, inline: true },
                        { name: '**REGION:**', value: `**${info.region}**`, inline: true },
                        { name: '**COUNTRY:**', value: `**${info.country}**`, inline: true },
                        { name: '**LOCATION:**', value: `**${info.loc}**`, inline: true },
                        { name: '**TIMEZONE:**', value: `**${info.timezone}**`, inline: true },
                        { name: '**POSTAL:**', value: `**${info.postal}**`, inline: true },
                        { name: '**INTERNET PROVIDER:**', value: `**${info.org.replace(/^AS\d+\s*/, '') || 'UNKNOWN'}**`, inline: true },
                        { name: '**DOMAIN:**', value: `**${info.hostname || 'Unknown'}**`, inline: true },
                    )
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error(error);
                await interaction.reply('There was an error while processing your request. Please try again later.');
            }
        } catch (error) {
            console.error(error);
        }
    }
}