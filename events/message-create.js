const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	name: 'messageCreate',
	once: false,
	execute(message) {
		if (message.content.indexOf('!') == 0) {
			switch (message.content.toLowerCase().slice(1)) {
			case 'resetup':
			case 're-setup':
			case 're setup':
				message.reply('Pushing Setup Command');
				break;
			default:
				return;
			}
		}
	},
};