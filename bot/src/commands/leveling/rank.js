const getConnection = require('../../functions/database/connectDatabase');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')
const calculateLevelXp = require('../../utility/database/calculate_level_xp');
const getEmbedColor = require('../../utility/database/get_embed_color');
const getRankBackground = require('../../utility/database/get_rank_background')
const { RankCardBuilder, Font } = require('canvacord');

Font.loadDefault();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Retrieve XP')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Choose a User')
        ),
    usage: '<user>',
    async execute(interaction) {
        try {
            const mentionedUserId = interaction.options.getUser('user')?.id;
            const specifiedUserId = mentionedUserId || interaction.member?.user.id;
            const specifiedUserObj = await interaction.guild?.members.fetch(specifiedUserId);
            const guildId = interaction.guild?.id;

            // Execute MySQL queries
            const connection = await getConnection();
            const [rows] = await connection.query('SELECT * FROM xp_system WHERE user_id = ? AND guild_id = ?', [
                specifiedUserId,
                interaction.guild?.id,
            ]);

            const fetchedLevel = rows[0];

            connection.release();

            const embedColor = await getEmbedColor(guildId, specifiedUserId);
            if (!fetchedLevel) {
                interaction.reply(
                    mentionedUserId ? `${specifiedUserObj?.user} doesn't have any XP yet!!` : `You Don't have Any XP Yet`
                );
                return;
            }

            const rankBackground = await getRankBackground(
                guildId,
                specifiedUserId
            );

            const xpNeeded = calculateLevelXp(fetchedLevel.level);
            const xpPercentage = Math.floor((fetchedLevel?.xp / xpNeeded) * 100);
            //const xpBar =

            const allLevels = await connection.query('SELECT user_id FROM xp_system WHERE guild_id = ? ORDER BY level DESC, xp DESC', [interaction.guild?.id]);

            const allLevelsArray = allLevels[0];
            const currentRank = allLevelsArray.findIndex((lvl) => lvl.user_id === specifiedUserId) + 1;

            const userStatus = specifiedUserObj?.presence?.status || 'online';

            const rank = new RankCardBuilder()
                .setUsername(specifiedUserObj?.user.username)
                .setDisplayName(specifiedUserObj?.user.displayName)
                .setAvatar(specifiedUserObj?.user.displayAvatarURL({ size: 256 }))
                .setCurrentXP(fetchedLevel.xp)
                .setRequiredXP(xpNeeded)
                .setLevel(fetchedLevel.level)
                .setRank(currentRank)
                .setStatus(userStatus)
                .setBackground(
                    rankBackground ??
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzV1vbZ5wC0si2M6FS-QYz46QFHBARjAOfLOcEyAXTX9dHxV11AjPZzi8&s=10'
                )
                .setOverlay(0.75)
                .setStyles({
                    avatar: {
                        style: {
                            width: '140px',
                            height: '140px'
                        }
                    },

                    username: {
                        style: {
                            fontSize: '36px',
                            fontWeight: 1000
                        }
                    },

                    displayName: {
                        style: {
                            fontSize: '24px'
                        }
                    },

                    progressbar: {
                        style: {
                            height: '18px',
                            width: '500px'
                        },
                        thumb: {
                            style: {
                                backgroundColor: embedColor
                            }
                        }
                    },

                    statistics: {
                        style: {
                            fontSize: '24px'
                        }
                    }
                })

            const data = await rank.build({ format: 'png' });
            const attachment = new AttachmentBuilder(data, {
                name: 'rank.png'
            });

            interaction.reply({files: [attachment]});

        } catch (error) {
            console.error(error);
        }
    }
}
