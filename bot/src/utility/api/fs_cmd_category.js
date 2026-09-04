const fs = require('fs');

async function cmdLoopDirs (client) {
    const commandDirs = fs.readdirSync('./src/commands');
    const { commands, commandArray } = client;

    const categories = new Map();

    for (const folder of commandDirs) {
        const commandFiles = fs
            .readdirSync(`./src/commands/${folder}`)
            .filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`../../commands/${folder}/${file}`);
            commands.set(command.data.name, { ...command, category: folder });
            commandArray.push(command.data);

            const categoryName = folder.toLowerCase(); // Use the subdirectory name as the category
            if (!categories.has(categoryName)) {
                categories.set(categoryName, []);
            }
            categories.get(categoryName).push(`\`${command.data.name}\``);
        }
    }

    return categories;
}

module.exports = { cmdLoopDirs };