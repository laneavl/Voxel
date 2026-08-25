module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        try {
            if (!interaction.isCommand()) return;
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
        }

    }
}