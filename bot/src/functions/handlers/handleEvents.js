const fs = require('fs');

module.exports = (client) => {
    client.events = async () => {
        const eventDirs = fs
            .readdirSync('./src/events')
            .filter(dir => {
                return fs.statSync(`./src/events/${dir}`).isDirectory();
            });

        for (const dir of eventDirs) {
            const eventFiles = fs
                .readdirSync(`./src/events/${dir}`)
                .filter(file => file.endsWith('.js'));

            for (const file of eventFiles) {
                const event = require(`../../events/${dir}/${file}`);
                if (!event.name || !event.execute) {
                    console.warn(
                        `Skipping invalid event: ${dir}/${file}`
                    );
                    continue;
                }
                if (event.once) {
                    client.once(
                        event.name,
                        (...args) => event.execute(...args, client)
                    );
                } else {
                    client.on(
                        event.name,
                        (...args) => event.execute(...args, client)
                    );
                }
            }
        }
    }
}