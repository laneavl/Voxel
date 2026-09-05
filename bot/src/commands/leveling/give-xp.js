const getConnection = require('../../functions/database/connectDatabase');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const calculateLevelXp = require('../../utility/database/calculate_level_xp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give-xp')
        .setDescription('Give XP to a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Choose a user')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of XP to give')
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

            let currentXp = 0;
            let currentLevel = 0;

            if (rows.length === 0) {
                await connection.query(
                    `
                    INSERT INTO xp_system
                    (
                        guild_id,
                        user_id,
                        xp,
                        level
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        guildId,
                        targetUser.id,
                        0,
                        0
                    ]
                );
            } else {
                currentXp = rows[0].xp;
                currentLevel = rows[0].level;
            }

            currentXp += amount;

            /*
             * Handle level-ups.
             *
             * If the user has enough XP for multiple levels,
             * this loop will continue until their XP is below
             * the requirement for the next level.
             */
            let levelsGained = 0;

            while (currentXp >= calculateLevelXp(currentLevel)) {
                const requiredXp = calculateLevelXp(currentLevel);

                currentXp -= requiredXp;
                currentLevel++;
                levelsGained++;
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
                `Gave **${amount.toLocaleString()} XP** to ${targetUser}.`;

            if (levelsGained > 0) {
                response +=
                    ` They gained **${levelsGained} level${levelsGained === 1 ? '' : 's'}** and are now level **${currentLevel}**.`;
            }

            await interaction.reply(response);

        } catch (error) {
            console.error('GIVE XP ERROR:', error);

            await interaction.reply({
                content: 'An error occurred while giving XP.',
                ephemeral: true
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
};