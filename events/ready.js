const dotenv = require('dotenv');
dotenv.config();
const mariadb = require('mariadb');
const pool = mariadb.createPool({
	host: process.env.DB_IP,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	connectionLimit: 5,
});
let conn;
async function checkID(id) {
	conn = await pool.getConnection();
	conn.query('select has_setup from h_servers where server_id =' + id)
		.then(rows => {
			console.log(rows);
		})
		.catch(err => {
			console.error(err);
		});
	conn.end();
}

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		// const path = require('node:path');
		// const { REST } = require('@discordjs/rest');
		// const { Routes } = require('discord-api-types/v9');

		// const commands = [];
		// const commandsPath = path.join(__dirname, '../commands/command-data');

		// const filePath = path.join(commandsPath, 'setup-data.js');
		// const command = require(filePath);
		// commands.push(command.data.toJSON());

		// console.log(client.guilds.cache.size);
		// for (let i = 0; i < client.guilds.cache.size; i++) {
		// 	const gInfo = client.guilds.cache.at(i);
		// 	console.log(gInfo.id);
		// 	if (!checkID(i)) {
		// 		const rest = new REST({ version: '9' }).setToken(process.env.token);

		// 		rest.put(Routes.applicationGuildCommands(client.user.id, gInfo.id), { body: commands })
		// 			.then(() => console.log(`Uploaded setup command to ${gInfo.id} (${gInfo.name})`))
		// 			.catch(console.error);
		// 	}
		// }
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};