var exports = module.exports = {};

exports.cfg = {};

exports.loadConfig = () => {
	try {
		var c = require("../config.json");
		exports.cfg = {
			port: c.port || 2137,
			debug: c.debug || true,
			'convert-passwords': c['convert-passwords'] || false,
			discord: {
				enable: c.discord.enable || false,
				token: c.discord.token || "",
				channelid: c.discord.channelid || ""
			},
			recaptcha: {
				enable: c.recaptcha.enable || false,
				site: c.recaptcha.site || "",
				secret: c.recaptcha.secret || ""
			},
			'session-secret': c['session-secret'] || 'cd18c21a37cc65adecb5e2021867a37e0aa3b5dd9a6e87ffdf299773b2ebc0ba5dddde08121591cf0da0fd43040a0325c153beed46b9eec39d7b43a393a64bed',
			database: {
				type: c.database.type || "sqlite",
				sqlite: {
					file: c.database.sqlite.file || "animawka.db"
				},
				mysql: {
					host: c.database.mysql.host || "localhost",
					port: c.database.mysql.port || 3306,
					database: c.database.mysql.database || "animawka",
					username: c.database.mysql.username || "debug",
					password: c.database.mysql.password || "debug"
				}
			}
		}
	} catch (e) {
		console.error("Wystapił błąd podczas ładowania konfiguracji!");
		console.error(e);
		process.exit(1);
	}
}