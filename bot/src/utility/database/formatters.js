const axios = require("axios");

// Helper functions to format data
function formatTime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsOnly = Math.floor(seconds % 60);
    if ((days, hours, minutes) < 1) {
        return `${secondsOnly} Seconds`;
    } else if ((days, hours) < 1) {
        return `${minutes} Minutes, ${secondsOnly} Seconds`;
    } else if (days < 1) {
        return `${hours} Hours, ${minutes} Minutes, ${secondsOnly} Seconds`;
    } else {
        return `${days} Days, ${hours} Hours, ${minutes} Minutes, ${secondsOnly} Seconds`;
    }
}

function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${Math.round(bytes * 10) / 10} ${units[i]}`;
}

function formatPercentage(number) {
    return `${Math.round(number * 100) / 100}%`;
}

async function getLatestBranchVersion(owner, repo, branch) {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`);
    return response.data.commit.sha.substring(0, 7);
}

module.exports = { formatTime, formatBytes, formatPercentage, getLatestBranchVersion };