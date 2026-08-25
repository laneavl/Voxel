const { ActivityType } = require("discord.js");
const config = require("../../config/config");

const activityList = [
    {
        name: "For New Servers",
        type: ActivityType.Watching,
    },
    {
        name: "Waiting For Activity",
        type: ActivityType.Custom,
    },
    {
        name: "dsc.gg/techcorner | /help",
        type: ActivityType.Custom,
    },
];

let currentActivityIndex = 0;

module.exports = {
    name: "ready",
    once: true,

    async execute(client) {
        try {
            const updatePresence = () => {
                if (!client.user) return;

                const currentActivity = activityList[currentActivityIndex];

                client.user.setPresence({
                    status: config.bot.status.status,
                    activities: [
                        {
                            name: currentActivity.name,
                            type: currentActivity.type,
                        },
                    ],
                });

                currentActivityIndex =
                    (currentActivityIndex + 1) % activityList.length;
            };

            // Set the initial presence immediately
            updatePresence();

            // Rotate the activity every 60 seconds
            const presenceInterval = setInterval(updatePresence, 60 * 1000);

            // Clean up the interval when the process exits
            process.once("exit", () => {
                clearInterval(presenceInterval);
            });

        } catch (error) {
            console.error("Error occurred while updating presence:", error);
        }
    },
};