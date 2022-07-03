const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Setup the bot for use'),
	async execute(i) {
		if (i.member.permissions.has('MANAGE_GUILD')) {
			i.reply({ content: 'Setup starting', ephemeral: true });
		}
		else {
			i.reply({ content: 'You do not have permission to run this command', ephemeral: true });
		}
	},
};
