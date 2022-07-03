// Setup .env file reading
const dotenv = require('dotenv');
dotenv.config();

const fs = require('node:fs');
const path = require('node:path');

// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');

// Database setup
const { MongoClient } = require('mongodb');
const uri = process.env.DB_STRING;
const mClient = new MongoClient(uri);

async function setupDB() {
	try {
		await mClient.connect();
		const db = mClient.db('helpy');
		await db.createCollection('servers')
			.catch(err => {
				if (err.code == 48) {
					return;
				}
				else {
					console.error(err);
				}
			});
	}
	finally {
		// Ensures that the client will close when you finish/error
		await mClient.close();
	}
}


async function setupClient() {
// Create a new client instance
	const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS] });

	// Get commands
	client.commands = new Collection();
	const commandsPath = path.join(__dirname, 'commands/command-data');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection
		// With the key as the command name and the value as the exported module
		client.commands.set(command.data.name, command);
	}

	// Get events
	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}

	// Listen for commands
	client.on('interactionCreate', async interaction => {
		if (!interaction.isCommand()) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	});

	// Login to Discord with your client's token
	console.log('Checking Database...');
	await setupDB();
	console.log('Database Connection successful');
	client.login(process.env.TOKEN);
}
setupClient();