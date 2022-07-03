const dotenv = require('dotenv');
dotenv.config();

const { MongoClient } = require('mongodb');
const uri = process.env.DB_STRING;
const mClient = new MongoClient(uri);

let tf;
async function checkDB(id) {
	try {
		await mClient.connect();
		const col = mClient.db('helpy').collection('servers');
		await col.findOne({ server_id: id })
			.then(result => {
				if (result == undefined || null) {
					tf = false;

				}
				else if (result.has_setupcmd == 1) {
					tf = true;

				}
				else if (result.has_setupcmd == 0) {
					tf = 0;

				}
			})
			.catch(err => {
				console.error(err);
			});
	}
	finally {
		// Ensures that the client will close when you finish/error
		await mClient.close();
	}
	return tf;
}

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		const path = require('node:path');
		const { REST } = require('@discordjs/rest');
		const { Routes } = require('discord-api-types/v9');

		const commands = [];
		const commandsPath = path.join(__dirname, '../commands/command-data');

		const filePath = path.join(commandsPath, 'setup-data.js');
		const command = require(filePath);
		commands.push(command.data.toJSON());

		for (let i = 0; i < client.guilds.cache.size; i++) {
			const gInfo = client.guilds.cache.at(i);
			if (await checkDB(gInfo.id) === false) {
				const rest = new REST({ version: '9' }).setToken(process.env.token);
				rest.put(Routes.applicationGuildCommands(client.user.id, gInfo.id), { body: commands })
					.then(() => console.log(`Uploaded setup command to ${gInfo.id} (${gInfo.name})`))
					.catch(console.error);
				try {
					await mClient.connect();
					const col = mClient.db('helpy').collection('servers');
					await col.insertOne({ has_setupcmd: 1, is_setup: 0, server_id: gInfo.id, server_name: gInfo.name });

				}
				finally {
					// Ensures that the client will close when you finish/error
					await mClient.close();
				}
			}
			else if (await checkDB(gInfo.id) === 0) {
				const rest = new REST({ version: '9' }).setToken(process.env.token);
				rest.put(Routes.applicationGuildCommands(client.user.id, gInfo.id), { body: commands })
					.then(() => console.log(`Uploaded setup command to ${gInfo.id} (${gInfo.name})`))
					.catch(console.error);
				try {
					await mClient.connect();
					const col = mClient.db('helpy').collection('servers');
					await col.updateOne(
						{ server_id: gInfo.id },
						{ $set: { has_setupcmd: 1 } });

				}
				finally {
					// Ensures that the client will close when you finish/error
					await mClient.close();
				}
			}
		}
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};