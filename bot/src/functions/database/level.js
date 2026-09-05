const { TextChannel } = require('discord.js');
const getConnection = require('./connectDatabase');
const calculateLevelXp = require('../../utility/database/calculate_level_xp')
const cooldowns = new Set();

module.exports = async (client) => {
    client.on('messageCreate', async (message) => {
        // Ignore bots and DMs
        if (message.author.bot || !message.guild) {
            return;
        }

        const guildId = message.guild.id;
        const userId = message.author.id;
        const username = message.author.username;
        const guildName = message.guild.name;

        let connection;

        // Prevent users from gaining XP more than once per minute
        if (cooldowns.has(userId)) {
            return;
        }

        try {
            connection = await getConnection();
            await connection.beginTransaction();

            // Get Leveling Configuration

            const [[channelConfig]] = await connection.query(
                `
                SELECT level_up
                FROM channel_config
                WHERE guild_id = ?
                `,
                [guildId]
            );

            const [[userConfig]] = await connection.query(
                `
                SELECT mention_on_level_up
                FROM user_config
                WHERE user_id = ?
                AND guild_id = ?
                `,
                [userId, guildId]
            );

            const [[levelConfig]] = await connection.query(
                `
                SELECT min_xp, max_xp
                FROM level_config
                WHERE guild_id = ?
                `,
                [guildId]
            );

            // Make sure leveling configuration exists

            if (!levelConfig) {
                await connection.rollback();
                return;
            }

            const minXP = Number(levelConfig.min_xp);
            const maxXP = Number(levelConfig.max_xp);

            const xpToGive = getRandomXp(minXP, maxXP);

            // Get the user's current level data

            const [[level]] = await connection.query(
                `
                SELECT *
                FROM xp_system
                WHERE user_id = ?
                AND guild_id = ?
                `,
                [userId, guildId]
            );

            // Create a new level record if one doesn't exist.

            if (!level) {
                console.log(
                    `Creating a new level record for ${username}`
                );

                await connection.query(
                    `
                    INSERT INTO xp_system
                    (
                     user_id,
                     guild_id,
                     xp,
                     total_xp,
                     user_name,
                     guild_name,
                     level
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        userId,
                        guildId,
                        xpToGive,
                        xpToGive,
                        username,
                        guildName,
                        0
                    ]
                );

                await connection.commit();
                cooldowns.add(userId);

                setTimeout(() => {
                    cooldowns.delete(userId);
                }, 60000);

                return;
            }

            let newXp = Number(level.xp) + xpToGive;
            let newTotalXp = Number(level.total_xp) + xpToGive;
            let newLevel = Number(level.level);

            let leveledUp = false;

            /*
             * Handle one or multiple level-ups.
             *
             * Example:
             * Level 2 needs 300 XP
             * User currently has 290 XP
             * They gain 25 XP
             *
             * 315 - 300 = 15 XP remaining
             * New level = 3
             */
            while (newXp >= calculateLevelXp(newLevel)) {
                const xpNeeded = calculateLevelXp(newLevel);

                newXp -= xpNeeded;
                newLevel++;

                leveledUp = true;
            }

            /*
             * Update the user's XP and level.
             */
            await connection.query(
                `
    UPDATE xp_system
    SET
        xp = ?,
        total_xp = ?,
        level = ?,
        user_name = ?,
        guild_name = ?
    WHERE user_id = ?
    AND guild_id = ?
    `,
                [
                    newXp,
                    newTotalXp,
                    newLevel,
                    username,
                    guildName,
                    userId,
                    guildId
                ]
            );

            /*
             * Assign any level roles they now qualify for.
             */
            if (leveledUp) {
                await assignLevelRoles(
                    message,
                    connection,
                    guildId,
                    newLevel
                );

                await sendLevelUpMessage(
                    message,
                    channelConfig,
                    userConfig,
                    newLevel
                );
            }

            /*
             * Commit transaction.
             */
            await connection.commit();

            /*
             * Start XP cooldown.
             */
            cooldowns.add(userId);

            setTimeout(() => {
                cooldowns.delete(userId);
            }, 60000);

        } catch (error) {
            console.log(
                'XP SYSTEM ERROR:',
                error
            );

            if (connection) {
                try {
                    await connection.rollback();
                } catch (rollbackError) {
                    console.log(
                        'XP SYSTEM ROLLBACK ERROR:',
                        rollbackError
                    );
                }
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    });
};

// Send the level-up announcement.
async function sendLevelUpMessage(
    message,
    channelConfig,
    userConfig,
    newLevel
) {
    const levelUpChannelId = channelConfig?.level_up;

    const mentionEnabled =
        Number(userConfig?.mention_on_level_up) === 1;

    let channel = null;

    if (levelUpChannelId) {
        channel = message.guild.channels.cache.get(levelUpChannelId);
    }

    if (!channel || !(channel instanceof TextChannel)) {
        channel = message.channel;
    }

    const user_config_link = 'https://dashboard.voxel.dev/userconfig'

    const warningMessage =
        `**NOTE: If you do not wish to be mentioned, please alter your user settings at: ${user_config_link}`;

    try {
        if (mentionEnabled) {
            if (newLevel % 3 === 0) {
                await channel.send(
                    `Congrats ${message.member}, you have just reached Level **${newLevel}**\n${warningMessage}**`
                );
            } else {
                await channel.send(
                    `Congrats ${message.member}, you have just reached Level **${newLevel}**`
                )
            }
        } else {
            await channel.send(
                `Congrats **${message.author.tag}**, you have just reached Level **${newLevel}**`
            )
        }

    } catch (error) {
        console.error(
            `Error sending level up message: ${error}`
        );
    }
}

// Assign roles based on the user's level.
async function assignLevelRoles(
    message,
    connection,
    guildId,
    currentLevel
) {
    const [roles] = await connection.query(
        `
        SELECT role_id, levels
        FROM level_roles_config
        WHERE guild_id = ?
        `,
        [guildId]
    );

    if (!roles.length) {
        return;
    }

    const member =
        message.guild.members.cache.get(message.author.id);

    if (!member) {
        console.error(
            `Member with ID ${message.author.id} not found.`
        );

        return;
    }

    for (const roleData of roles) {
        const role = message.guild.roles.cache.get(roleData.role_id);

        if (!role) {
            console.error(
                `Role with ID ${roleData.role_id} not found.`
            );

            continue;
        }

        if (currentLevel < roleData.levels) {
            continue;
        }

        if (member.roles.cache.has(role.id)) {
            continue;
        }

        try {
            await member.roles.add(role);

            console.log(
                `Assigned role ${role.name} to ${message.author.tag}`
            );
        } catch (error) {
            console.error(
                `Error assigning role ${role.name} to ${message.author.tag}:`,
                error
            );
        }
    }
}

// Generate a random XP amount between min and max.
function getRandomXp(minXP, maxXP) {
    minXP = Math.ceil(Number(minXP));
    maxXP = Math.floor(Number(maxXP));

    return Math.floor(
        Math.random() * (maxXP - minXP + 1)
    ) + minXP;
}