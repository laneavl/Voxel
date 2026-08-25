const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

const config = require('../../config/config');

module.exports = (client) => {

    client.handleCommands = async () => {

        const commandDirs = fs
            .readdirSync('./src/commands')
            .filter(dir => {
                return fs.statSync(`./src/commands/${dir}`).isDirectory();
            });

        for (const dir of commandDirs) {
            const commandFiles = fs
                .readdirSync(`./src/commands/${dir}`)
                .filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {

                const commandPath = `../../commands/${dir}/${file}`;
                const command = require(commandPath);

                if (!command.data || !command.execute) {
                    console.warn(
                        `Skipping invalid command: ${dir}/${file}`
                    );
                    continue;
                }
                const commandName = command.data.name;
                if (!commandName) {
                    console.warn(
                        `Skipping command without a name: ${dir}/${file}`
                    );
                    continue;
                }

                client.commands.set(
                    commandName,
                    command
                );


                client.commandArray.push(
                    command.data
                );
            }
        }

        const clientId = config.bot.clientId;

        const rest = new REST({
            version: '9'
        }).setToken(
            config.bot.token
        );

        try {
            console.log(
                `Started refreshing Application (/) Commands at ${new Date().toLocaleString()}`
            );
            await rest.put(
                Routes.applicationCommands(clientId),
                {
                    body: client.commandArray
                }
            );
            console.log(
                `Successfully reloaded Application (/) commands at ${new Date().toLocaleString()}`
            );
            console.log(
                '---------------------------------------------------------'
            );

        } catch (error) {
            console.error(
                'ERROR REGISTERING APPLICATION COMMANDS:',
                error
            );
        }
    };
};