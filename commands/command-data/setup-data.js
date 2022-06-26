const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Setup the bot for use'),
	async execute(interaction) {
		await interaction.reply('Command not done');
	},
};
