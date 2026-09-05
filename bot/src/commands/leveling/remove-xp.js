const getConnection = require('../../functions/database/connectDatabase');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const calculateLevelXp = require('../../utility/database/calculate_level_xp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-xp')
        .setDescription('Remove XP from a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Choose a user')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of XP to remove')
                .setRequired(true)
                .setMinValue(1)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    usage: '<user> <amount>',

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const guildId = interaction.guild.id;

        let connection;

        try {
            connection = await getConnection();

            const [rows] = await connection.query(
                `
                SELECT *
                FROM xp_system
                WHERE user_id = ?
                AND guild_id = ?
                `,
                [
                    targetUser.id,
                    guildId
                ]
            );

            /*
             * User doesn't have an XP record.
             */
            if (rows.length === 0) {
                await interaction.reply({
                    content: `${targetUser} doesn't have any XP to remove.`,
                    ephemeral: true
                });

                return;
            }

            let currentXp = rows[0].xp;
            let currentLevel = rows[0].level;

            let xpToRemove = amount;
            let levelsLost = 0;

            /*
             * Remove XP.
             *
             * If we remove more XP than the user currently
             * has in their level, move them down a level
             * and continue removing XP.
             */
            while (xpToRemove > currentXp && currentLevel > 0) {

                /*
                 * Remove the XP currently held in this level.
                 */
                xpToRemove -= currentXp;

                /*
                 * Move down one level.
                 */
                currentLevel--;
                levelsLost++;

                /*
                 * The user now starts at the XP requirement
                 * of the previous level.
                 */
                currentXp = calculateLevelXp(currentLevel);
            }

            /*
             * Remove whatever XP remains.
             */
            currentXp -= xpToRemove;

            /*
             * Prevent XP from ever becoming negative.
             */
            if (currentXp < 0) {
                currentXp = 0;
            }

            /*
             * If we've reached level 0, XP cannot go
             * below zero.
             */
            if (currentLevel === 0 && currentXp < 0) {
                currentXp = 0;
            }

            await connection.query(
                `
                UPDATE xp_system
                SET xp = ?,
                    level = ?
                WHERE user_id = ?
                AND guild_id = ?
                `,
                [
                    currentXp,
                    currentLevel,
                    targetUser.id,
                    guildId
                ]
            );

            let response =
                `Removed **${amount.toLocaleString()} XP** from ${targetUser}.`;

            if (levelsLost > 0) {
                response +=
                    ` They lost **${levelsLost} level${levelsLost === 1 ? '' : 's'}** and are now level **${currentLevel}**.`;
            }

            /*
             * Show their new XP position.
             */
            response +=
                ` They now have **${currentXp.toLocaleString()} XP** at level **${currentLevel}**.`;

            await interaction.reply(response);

        } catch (error) {
            console.error('REMOVE XP ERROR:', error);

            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(
                    'An error occurred while removing XP.'
                );
            } else {
                await interaction.reply({
                    content: 'An error occurred while removing XP.',
                    ephemeral: true
                });
            }

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
};