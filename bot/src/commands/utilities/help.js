const fs = require('fs');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const getEmbedColor = require('../../utility/database/get_embed_color');
const { cmdLoopDirs } = require('../../utility/api/fs_cmd_category')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help Menu')
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('Specific Command')
        ),
    usage: '<Command Name> (Optional)',
    async execute(interaction, client) {
        try {
            const guildId = interaction.guild?.id;
            const userId = interaction.member.user.id;

            const specificCommandName = interaction.options.getString('command');
            const commandDirs = fs.readdirSync('./src/commands');
            const {commands, commandArray} = client;
            const embedColor = await getEmbedColor(guildId, userId);

            if (specificCommandName) {
                const specificCommand = commands.get(specificCommandName.toLowerCase());
                const commandUsage = `/${specificCommand.data.name} ${specificCommand.usage}`

                if (specificCommand) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Command: ${specificCommand.data.name}`)
                        .setColor(embedColor)
                        .addFields({name: 'Description', value: specificCommand.data.description})
                        .addFields({name: 'Usage', value: commandUsage || 'No usage provided'});

                    interaction.reply({embeds: [embed]});
                } else {
                    interaction.reply('Specified command not found.');
                }
            } else {

                const categories = await cmdLoopDirs(client);

                const embed = new EmbedBuilder()
                    .setTitle('Help Menu')
                    .setThumbnail(client.user.displayAvatarURL())
                    .setColor(embedColor)
                    .setTimestamp();

                categories.forEach((commands, category) => {
                    embed.addFields({name: `★ ${category.toUpperCase()}`, value: commands.join(', ')});
                });

                interaction.reply({embeds: [embed]})
            }
        } catch (error) {
            console.error(error);
        }
    }
}