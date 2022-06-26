const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user-info')
		.setDescription('Gets info about a user'),
	async execute(interaction) {
		await interaction.reply('Command not done');
	},
};
