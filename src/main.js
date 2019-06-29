const os = require("os"),
	config = require('./config.js'),
	database = require('./database.js'),
	server = require('./server.js');

var exports = module.exports = {};

exports.start = () => {
	if (!version) version = "unknown";
	platform = {
		os: os.platform(),
		version: os.release(),
		hostname: os.hostname(),
		arch: os.arch()
	}
	console.log("Project Ayano v" + version + " // Animawka.pl backend :: created by Gabixdev & Heniooo & Pixel");
	config.loadConfig();
	process.env.NODE_ENV = config.cfg.debug ? 'development' : 'production';
	
	debug = config.cfg.debug; // wyrzucamy to na global

	database.dbConnect(config.cfg);
	exports.db = database.db;
	server.start(config.cfg);
};
