const feature_config = require('../../functions/models/feature_config');

module.exports = {
    name: 'messageCreate',
    once: false,

    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;

        try {
            const enableConfig = await feature_config.get(message.guild.id);



            if (message.content.startsWith('sudo rm -rf')) {
                if (!enableConfig || enableConfig.sudo !== 1) {
                    message.channel.send(`The *sudo* feature is not enabled. Please contact a server admin to have it added!`);
                    return;
                }
                const arg = message.content.slice(11).trim();

                const response = await message.channel.send(
                    `I'm going to remove the folder \`${arg}\`...`
                );

                setTimeout(async() => {
                    try {
                        await response.edit({
                            content: `\`${arg}\` has been deleted!`
                        });
                    } catch (error) {
                        console.error(
                            'Error editing sudo response:',
                            error
                        );
                    }
                }, 3000);
            } else if (message.content.startsWith('sudo shutdown')) {
                if (!enableConfig || enableConfig.sudo !== 1) {
                    message.channel.send(`The *sudo* feature is not enabled. Please contact a server admin to have it added!`);
                    return;
                }
                await message.channel.send('Shutting Down...');
            }
        } catch (error) {
            console.error('Error in sudo event:', error);
        }
    }
};