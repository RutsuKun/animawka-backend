var exports = module.exports = {};

exports.cfg = {};

exports.loadConfig = () => {
	try {
		exports.cfg = require("../config.json");
	} catch (e) {
		console.error("Wystapił błąd podczas ładowania konfiguracji!");
		console.error(e);
		process.exit(1);
	}
}