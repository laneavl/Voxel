const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { processImageGeneration } = require('../../utility/ai/ai_control');
const feature_config = require('../../functions/models/feature_config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imagine')
        .setDescription('Generate an image with Voxel AI')
        .addStringOption(option =>
            option
                .setName('prompt')
                .setDescription('Describe the image you want to generate')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('quality')
                .setDescription('Image quality')
                .addChoices(
                    { name: 'Low', value: 'low' },
                    { name: 'Medium', value: 'medium' },
                    { name: 'High', value: 'high' }
                )
        )
        .addStringOption(option =>
            option
                .setName('size')
                .setDescription('Image Size')
                .addChoices(
                    { name: 'Square', value: '1024x1024' },
                    { name: 'Portrait', value: '1024x1536' },
                    { name: 'Landscape', value: '1536x1024' }
                )
        ),
    usage: '<prompt>',
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        const quality = interaction.options.getString('quality') ?? 'medium';
        const size = interaction.options.getString('size') ?? '1024x1024';

        const enableConfig = await feature_config.get(interaction.guild.id);

        await interaction.deferReply();

        if (!enableConfig || enableConfig.ai_chat !== 1) {
            await interaction.editReply({
                content: `This Function is not enabled. Please contact an administrator to enable this feature`,
                ephemeral: true
            })
            return;
        }

        try {
            const imageBuffer = await processImageGeneration(
                prompt,
                quality,
                size
            );

            const attachment = new AttachmentBuilder(
                imageBuffer,
                {
                    name: 'voxel-image.png'
                }
            );

            await interaction.editReply({
                content: `Generated image for: **${prompt}**`,
                files: [attachment]
            });
        } catch (error) {
            console.error('IMAGE COMMAND ERROR:', error);
            if (error.status === 429) {
                await interaction.editReply(
                    'Voxel has temporarily reached the image generation limit. Please try again later.'
                );
            } else {
                await interaction.editReply(
                    "Sorry, I couldn't generate that image"
                )
            }
        }
    }
}

