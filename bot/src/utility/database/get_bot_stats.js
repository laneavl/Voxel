const discord_version = require('../../../package.json')
const os = require('os');
const version = require('../../config/config').version;
const github_info = require('../../config/config').github;
const wsversion = require('../../config/config').database;
//const { version, github_info } = require('../../config/config');

const {
    formatTime,
    formatBytes,
    formatPercentage,
    getLatestBranchVersion
} = require('./formatters');

async function getBotStats() {
    const uptime = formatTime(process.uptime());

    const usedMemory = formatBytes(
        process.memoryUsage().heapUsed
    );

    const totalMemory = formatBytes(
        os.totalmem()
    );

    const freeMemory = formatBytes(
        os.freemem()
    );

    const cpuUsageMicroSeconds = process.cpuUsage().user;
    const cpuUsageSeconds =
        cpuUsageMicroSeconds / 1000000; // Convert to seconds

    const cpuUsagePercentage =
        (cpuUsageSeconds / process.uptime()) * 100;

    const formattedCpuUsage =
        formatPercentage(cpuUsagePercentage);

    const nodeVersion = process.versions.node;

    const libraryName = 'Discord.JS';

    const libraryVersion =
        discord_version.dependencies["discord.js"].replace('^', '');;

    const runtimeVersion = process.version;

    const botversion =
        version.version;

    const websocket_version =
        wsversion.websocket_version;

    const github_owner =
        github_info.repo_owner;

    const github_repo =
        github_info.repo_name;

    const github_branch =
        github_info.branch_name;

    const buildversion =
        await getLatestBranchVersion(
            github_owner,
            github_repo,
            github_branch
        );

    return {
        uptime,
        usedMemory,
        totalMemory,
        freeMemory,
        cpuUsagePercentage,
        formattedCpuUsage,
        nodeVersion,
        libraryName,
        libraryVersion,
        runtimeVersion,
        botversion,
        websocket_version,
        github_owner,
        github_repo,
        github_branch,
        buildversion
    };
}

module.exports = getBotStats;