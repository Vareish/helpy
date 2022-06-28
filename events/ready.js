const dotenv = require('dotenv');
dotenv.config();
const mariadb = require('mariadb');
const pool = mariadb.createPool({
	host: process.env.DB_IP,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
});
let conn;
let tf;
async function checkDB(id) {
	conn = await pool.getConnection();
	conn.query('select has_setupcmd from h_servers as val where server_id =' + id)
		.then(result => {
			if (result[0] == undefined) {
				tf = false;
			}
			else if (result[0].has_setupcmd == 1) {
				tf = true;
			}
			else if (result[0].has_setupcmd == 0) {
				tf = 0;
			}
		})
		.catch(err => {
			console.error(err);
		});
	conn.end();
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
			if (await checkDB(gInfo.id) == undefined) {
				console.warn('Got undefined when checking for guild setups. Repeating.');
				i = -1; continue;
			}
			if (await checkDB(gInfo.id) === false) {
				const rest = new REST({ version: '9' }).setToken(process.env.token);
				rest.put(Routes.applicationGuildCommands(client.user.id, gInfo.id), { body: commands })
					.then(() => console.log(`Uploaded setup command to ${gInfo.id} (${gInfo.name})`))
					.catch(console.error);
				conn = await pool.getConnection();
				conn.query({ sql: `INSERT INTO h_servers (has_setupcmd, is_setup, server_id, server_name)
					VALUES (1, 0, ${gInfo.id}, '${gInfo.name}')`,
				})
					.catch(err => {
						console.error(err);
					});
				conn.end();
			}
			else if (await checkDB(gInfo.id) === 0) {
				const rest = new REST({ version: '9' }).setToken(process.env.token);
				rest.put(Routes.applicationGuildCommands(client.user.id, gInfo.id), { body: commands })
					.then(() => console.log(`Uploaded setup command to ${gInfo.id} (${gInfo.name})`))
					.catch(console.error);
				conn = await pool.getConnection();
				conn.query({ sql: `UPDATE h_servers
				SET has_setupcmd = 1
				WHERE server_id = ${gInfo.id}`,
				})
					.catch(err => {
						console.error(err);
					});
				conn.end();
			}
		}
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};