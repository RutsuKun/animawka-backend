const config = require('./config.js'),
	database = require('./database.js'),
	server = require('./server.js');

var exports = module.exports = {};

exports.start = () => {
	console.log("Project Ayano // Animawka.pl backend :: created by gabixdev");
	config.loadConfig();
	
	process.env.NODE_ENV = config.cfg.debug ? 'development' : 'production';

	database.dbConnect(config.cfg);
	exports.db = database.db;
	server.start(config.cfg);
};
