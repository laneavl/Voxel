const express = require('express');
const config = require('../../config/config');

const feature_config = require('../../functions/models/feature_config');
const channel_config = require('../../functions/models/channel_config');
const misc_config = require('../../functions/models/misc_config');
const level_config = require('../../functions/models/level_config');
const level_roles_config = require('../../functions/models/level_roles_config')
const logger_enable_config = require('../../functions/models/logger_enable_config')
const logger_channel_config = require('../../functions/models/logger_channel_config')

// Guild Configuration

function startApiServer(client) {
    const app = express();

    const PORT = Number(
        config.server.botApiPort || 3004
    );

    const INTERNAL_API_KEY =
        config.server.internalApiKey;

    if (!INTERNAL_API_KEY) {
        throw new Error(
            'INTERNAL_API_KEY is not configured.'
        )
    }

    app.use(express.json());

    // Internal Authentication

    function requireInternalAuth(req, res, next) {
        const providedKey =
            req.get('X-Dashboard-Internal-Key');

        if (
            !providedKey ||
            providedKey !== INTERNAL_API_KEY
        ) {
            return res.status(401).json({
                error: 'Unauthorized.'
            });
        }

        next();
    }

    function getGuild(guildId, client) {
        return client.guilds.cache.get(guildId);
    }

    function requireGuild(guildId, client, res) {
        const guild = getGuild(guildId, client);

        if (!guild) {
            res.status(404).json({
                error: 'Guild not found.'
            });

            return null;
        }

        return guild;
    }

    // Health

    app.get(
        '/internal/health',
        requireInternalAuth,
        (req, res) => {
            res.json({
                online: true,
                botReady: client.isReady(),
                uptime: process.uptime()
            });
        }
    );

    app.get(
        '/internal/guilds',
        requireInternalAuth,
        (req, res) => {
            const guilds = client.guilds.cache.map(
                guild => ({
                    id: guild.id,
                    name: guild.name,
                    icon: guild.icon,
                    owner: guild.ownerId === client.user?.id,
                    permissions: '0'
                })
            );

            res.json(guilds);
        }
    );

    app.get(
        '/internal/guilds/:guildId/config',
        requireInternalAuth,
        async (req, res) => {
            try {
                const { guildId } = req.params;

                const guild = requireGuild(
                    guildId,
                    client,
                    res
                );

                if (!guild) {
                    return;
                }

                const [
                    enable,
                    channels,
                    misc,
                    level,
                    levelRoles,
                    loggingEnable,
                    loggingChannels
                ] = await Promise.all([
                    feature_config.get(guildId),
                    channel_config.get(guildId),
                    misc_config.get(guildId),
                    level_config.get(guildId),
                    level_roles_config.get(guildId),
                    logger_enable_config.get(guildId),
                    logger_channel_config.get(guildId)
                ]);

                const discordChannels = guild.channels.cache
                    .filter(channel =>
                        channel.isTextBased() &&
                        !channel.isThread()
                    )
                    .map(channel => ({
                        id: channel.id,
                        name: channel.name,
                        type: channel.type
                    }))
                    .sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );
                const discordRoles = guild.roles.cache
                    .filter(role => !role.managed)
                    .map(role => ({
                        id: role.id,
                        name: role.name,
                        position: role.position,
                        managed: role.managed
                    }))
                    .sort((a, b) =>
                        b.position - a.position
                    );
                res.json({
                    guild: {
                        id: guild.id,
                        name: guild.name,
                        icon: guild.icon,
                    },
                    logging: {
                        enable: loggingEnable,
                        channels: loggingChannels,
                    },
                    enable,
                    channels,
                    misc,
                    level: {
                        ...level,
                        roles: levelRoles,
                    },
                    discordChannels,
                    discordRoles
                });
            } catch (error) {
                console.error(
                    'Failed to load guild configuration:',
                    error
                );

                res.status(500).json({
                    error: 'Failed to load guild configuration.'
                });
            }
        }
    );

    app.put(
        '/internal/guilds/:guildId/config',
        requireInternalAuth,
        async (req, res) => {
            try {
                const {guildId} = req.params;
                const {
                    enable,
                    misc,
                    level,
                    channels,
                    logging
                } = req.body;

                // Make sure the bot is actually in this guild.
                const guild = client.guilds.cache.get(guildId);

                if (!guild) {
                    return res.status(404).json({
                        error: 'Guild not found.'
                    });
                }

                // Update enable/disable settings
                if (enable && typeof enable === 'object') {
                    const allowedEnableSettings = [
                        'ai_chat',
                        'auto_role',
                        'bump',
                        'economy',
                        'fun_fact',
                        'greeter',
                        'leaver',
                        'leveling',
                        'moderation',
                        'modmail',
                        'music',
                        'reddit',
                        'rss',
                        'self_ping',
                        'sudo'
                    ];

                    for (const setting of allowedEnableSettings) {
                        if (
                            Object.prototype.hasOwnProperty.call(
                                enable,
                                setting
                            )
                        ) {
                            await feature_config.set(
                                guildId,
                                setting,
                                Boolean(enable[setting])
                            );
                        }
                    }
                }

                // Update feature channel settings.
                if (channels && typeof channels === 'object') {
                    const allowedChannelSettings = [
                        'ai_chat', 'bump', 'fun_fact', 'greeter', 'leaver',
                        'rss', 'level_up', 'modmail'
                    ];

                    for (const setting of allowedChannelSettings) {
                        if (Object.prototype.hasOwnProperty.call(channels, setting)) {
                            await channel_config.set(guildId, setting, channels[setting]);
                        }
                    }
                }

                // Update miscellaneous settings.

                if (misc && typeof misc === 'object') {
                    const allowedMiscSettings = [
                        'auto_role',
                        'bump_role',
                        'master_color'
                    ];

                    for (const setting of allowedMiscSettings) {
                        if (
                            Object.prototype.hasOwnProperty.call(
                                misc,
                                setting
                            )
                        ) {
                            await misc_config.set(
                                guildId,
                                setting,
                                misc[setting]
                            );
                        }
                    }
                }

                // Update leveling settings.

                if (level && typeof level === 'object') {
                    const allowedLevelSettings = [
                        'min_xp',
                        'max_xp',
                        'leaderboard_style',
                        'leaderboard_background',
                        'rank_card_background'
                    ];

                    for (const setting of allowedLevelSettings) {
                        if (
                            Object.prototype.hasOwnProperty.call(
                                level,
                                setting
                            )
                        ) {
                            await level_config.set(
                                guildId,
                                setting,
                                level[setting]
                            );
                        }
                    }

                    if (Array.isArray(level.roles)) {
                        const existingRoles =
                            await level_roles_config.get(guildId);

                        const submittedRoleIds = new Set(
                            level.roles
                                .filter(role =>
                                    typeof role.role_id === 'string' &&
                                    role.role_id.length > 0
                                )
                                .map(role => role.role_id)
                        );

                        // Remove roles that no longer exist in the submitted configuration
                        for (const existingRole of existingRoles) {
                            if (!submittedRoleIds.has(existingRole.role_id)) {
                                await level_roles_config.remove(
                                    guildId,
                                    existingRole.role_id
                                );
                            }
                        }

                        // Create or update submitted level roles
                        for (const levelRole of level.roles) {
                            if (
                                typeof levelRole.role_id !== 'string' ||
                                !levelRole.role_id
                            ) {
                                continue;
                            }

                            if (
                                !Number.isInteger(Number(levelRole.levels)) ||
                                Number(levelRole.levels) < 0
                            ) {
                                continue;
                            }

                            const role =
                                guild.roles.cache.get(
                                    levelRole.role_id
                                );

                            if (!role) {
                                continue;
                            }

                            const existingRole =
                                await level_roles_config.getRole(
                                    guildId,
                                    levelRole.role_id
                                );

                            if (existingRole) {
                                await level_roles_config.update(
                                    guildId,
                                    levelRole.role_id,
                                    Number(levelRole.levels)
                                );
                            } else {
                                await level_roles_config.create(
                                    guildId,
                                    guild.name,
                                    levelRole.role_id,
                                    Number(levelRole.levels)
                                );
                            }
                        }
                    }
                }

                // Update logging enable/disable settings.
                if (logging?.enable && typeof logging.enable === 'object') {
                    const allowedLoggingSettings = [
                        'channel_create',
                        'channel_delete',
                        'channel_update',
                        'guild_ban_add',
                        'guild_ban_remove',
                        'guild_emojis_create',
                        'guild_emojis_delete',
                        'guild_emojis_update',
                        'guild_member_add',
                        'guild_member_delete',
                        'guild_member_kick',
                        'guild_member_nick_update',
                        'guild_member_update',
                        'guild_role_create',
                        'guild_role_delete',
                        'guild_role_update',
                        'guild_update',
                        'message_delete',
                        'message_delete_bulk',
                        'message_update',
                        'voice_channel_join',
                        'voice_channel_leave',
                        'voice_channel_switch',
                        'voice_state_update'
                    ];

                    for (const setting of allowedLoggingSettings) {
                        if (
                            Object.prototype.hasOwnProperty.call(
                                logging.enable,
                                setting
                            )
                        ) {
                            await logger_enable_config.set(
                                guildId,
                                setting,
                                Boolean(logging.enable[setting])
                            );
                        }
                    }
                }

                // Update logging channel settings.
                if (logging?.channels && typeof logging.channels === 'object') {
                    const allowedLoggingChannels = [
                        'channel_create',
                        'channel_delete',
                        'channel_update',
                        'guild_ban_add',
                        'guild_ban_remove',
                        'guild_emojis_create',
                        'guild_emojis_delete',
                        'guild_emojis_update',
                        'guild_member_add',
                        'guild_member_delete',
                        'guild_member_kick',
                        'guild_member_nick_update',
                        'guild_member_update',
                        'guild_role_create',
                        'guild_role_delete',
                        'guild_role_update',
                        'guild_update',
                        'message_delete',
                        'message_delete_bulk',
                        'message_update',
                        'voice_channel_join',
                        'voice_channel_leave',
                        'voice_channel_switch',
                        'voice_state_update'
                    ];

                    for (const setting of allowedLoggingChannels) {
                        if (
                            Object.prototype.hasOwnProperty.call(
                                logging.channels,
                                setting
                            )
                        ) {
                            await logger_channel_config.set(
                                guildId,
                                setting,
                                logging.channels[setting]
                            );
                        }
                    }
                }

                /*
             * Return the updated configuration.
             */
                console.log('[API] Saving complete. Loading updated configuration...');

                const updatedEnable = await feature_config.get(guildId);
                console.log('[API] feature_config loaded');

                const updatedChannels = await channel_config.get(guildId);
                console.log('[API] channel_config loaded');

                const updatedMisc = await misc_config.get(guildId);
                console.log('[API] misc_config loaded');

                const updatedLevel = await level_config.get(guildId);
                console.log('[API] level_config loaded');

                const updatedLevelRoles = await level_roles_config.get(guildId);
                console.log('[API] level_roles_config loaded');

                const updatedLoggingEnable = await logger_enable_config.get(guildId);
                console.log('[API] logger_enable_config loaded');

                const updatedLoggingChannels = await logger_channel_config.get(guildId);
                console.log('[API] logger_channel_config loaded');

                console.log('[API] Sending configuration response...');

                return res.json({
                    success: true,
                    guild: {
                        id: guild.id,
                        name: guild.name,
                        icon: guild.icon
                    },
                    enable: updatedEnable,
                    channels: updatedChannels,
                    misc: updatedMisc,
                    level: {
                        ...updatedLevel,
                        roles: updatedLevelRoles
                    },
                    logging: {
                        enable: updatedLoggingEnable,
                        channels: updatedLoggingChannels
                    }
                });

            } catch (error) {
                console.error(
                    'Failed to update guild configuration:',
                    error
                );

                res.status(500).json({
                    error:
                        'Failed to update guild configuration.'
                });
            }
        }
    );

    app.patch(
        '/internal/guilds/:guildId/config',
        requireInternalAuth,
        async (req, res) => {
            try {
                const { guildId } = req.params;
                const { category, setting, value } = req.body;

                const guild = requireGuild(
                    guildId,
                    client,
                    res
                );

                if (!guild) {
                    return;
                }

                if (
                    typeof category !== 'string' ||
                    typeof setting !== 'string'
                ) {
                    return res.status(400).json({
                        error:
                            'category and setting are required.'
                    });
                }

                if (category === 'level' && setting === 'roles') {
                    const { role_id, levels } = value || {};

                    if (typeof role_id !== 'string') {
                        return res.status(400).json({
                            error: 'role_id is required.'
                        });
                    }

                    if (
                        !Number.isInteger(levels) ||
                        levels < 0
                    ) {
                        return res.status(400).json({
                            error: 'levels must be a non-negative integer.'
                        });
                    }

                    const role = guild.roles.cache.get(role_id);

                    if (!role) {
                        return res.status(400).json({
                            error: 'Role not found in this server.'
                        });
                    }

                    const existingRole = await level_roles_config.getRole(
                        guildId,
                        role_id
                    );

                    if (existingRole) {
                        await level_roles_config.update(
                            guildId,
                            role_id,
                            levels
                        );
                    } else {
                        await level_roles_config.create(
                            guildId,
                            guild.name,
                            role_id,
                            levels
                        );
                    }

                    const updatedLevelRoles =
                        await level_roles_config.get(guildId);

                    const roles = updatedLevelRoles
                        .map(levelRole => {
                            const discordRole =
                                guild.roles.cache.get(
                                    levelRole.role_id
                                );

                            return {
                                id: levelRole.id,
                                role_id: levelRole.role_id,
                                role_name:
                                    discordRole?.name ||
                                    'Deleted Role',
                                levels: levelRole.levels
                            };
                        })
                        .sort((a, b) =>
                            a.levels - b.levels
                        );

                    return res.json({
                        success: true,
                        category: 'level',
                        setting: 'roles',
                        config: roles
                    });
                }

                if (
                    category === 'level' &&
                    setting === 'removeRole'
                ) {
                    const { role_id } = value || {};

                    if (typeof role_id !== 'string') {
                        return res.status(400).json({
                            error: 'role_id is required.'
                        });
                    }

                    await level_roles_config.remove(
                        guildId,
                        role_id
                    );

                    const updatedLevelRoles =
                        await level_roles_config.get(guildId);

                    const roles = updatedLevelRoles
                        .map(levelRole => {
                            const role =
                                guild.roles.cache.get(
                                    levelRole.role_id
                                );

                            return {
                                id: levelRole.id,
                                role_id: levelRole.role_id,
                                role_name:
                                    role?.name ||
                                    'Deleted Role',
                                levels: levelRole.levels
                            };
                        })
                        .sort((a, b) =>
                            a.levels - b.levels
                        );

                    return res.json({
                        success: true,
                        category: 'level',
                        setting: 'roles',
                        config: roles
                    });
                }

                const models = {
                    enable: feature_config,
                    channels: channel_config,
                    misc: misc_config,
                    level: level_config,
                    loggingEnable: logger_enable_config,
                    loggingChannels: logger_channel_config
                };

                const model = models[category];

                if (!model) {
                    return res.status(400).json({
                        error:
                            'Invalid configuration category.'
                    });
                }

                await model.set(
                    guildId,
                    setting,
                    value
                );

                const updated = await model.get(
                    guildId
                );

                res.json({
                    success: true,
                    category,
                    setting,
                    value,
                    config: updated
                });

            } catch (error) {
                console.error(
                    'Failed to update guild configuration:',
                    error
                );

                if (
                    /^Invalid [a-z_]+_config setting:/.test(
                        error.message || ''
                    )
                ) {
                    return res.status(400).json({
                        error: error.message
                    });
                }

                res.status(500).json({
                    error:
                        'Failed to update guild configuration.'
                });
            }
        }
    );

    const server = app.listen(
        PORT,
        '0.0.0.0',
        () => {
            console.log(
                `Voxel internal API listening on port ${PORT}`
            );
        }
    );

    return server;
}

module.exports = startApiServer;
