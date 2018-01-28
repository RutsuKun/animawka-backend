const Sequelize = require('sequelize'),
	crypto = require('crypto'),
	scrypt = require('scryptsy');

var exports = module.exports = {};
var db = {};
var convertPasswords = false;

exports.dbConnect = cfg => {
	try {
		switch (cfg.database.type) {
			case "sqlite":
				db = new Sequelize('animawka', null, null, {
					dialect: "sqlite",
					pool: {
						max: 5,
						min: 0,
						acquire: 30000,
						idle: 10000
					},
					storage: cfg.database.sqlite.file,
				});
				break;
			case "mysql":
				db = new Sequelize(cfg.database.mysql.database, cfg.database.mysql.username, cfg.database.mysql.password, {
					dialect: "mysql",
					pool: {
						max: 5,
						min: 0,
						acquire: 30000,
						idle: 10000
					},
				});
				break;
			default:
				throw new Error("Nieznany typ bazy danych!");
		}
		db.authenticate()
			.then(() => {
				console.log("Połączono z bazą danych!");
			})
			.catch(err => {
				throw err;
			});
	} catch (e) {
		console.error("Wystapił błąd podczas łączenia się z bazą danych!");
		console.error(e);
		process.exit(1);
	}

};

exports.getLastEpisodes = async () => {
	var data = await db.query("SELECT * FROM episodes ORDER BY ID DESC LIMIT 6");
	var animes = [];

	for (var i = 0; i < data[0].length; i++) {
		var anime = await db.query("SELECT * FROM anime WHERE ID = '" + db.escape(data[0][i].anime) + "'");
		if (anime[0] && anime[0][0]) {
			anime[0][0].episode = data[0][i].episode;
			animes.push(anime[0][0]);
		}
	}
	return animes;
};

exports.authenticate = async (user, pass) => {
	var u = await db.query("SELECT * FROM users WHERE email=" + db.escape(user) + " OR login="+ db.escape(user));
	console.log(u);
	if (u[0] && u[0][0]) {
		if (u[0][0].password.length === 32) { // bo kurwa henicz uzyl jebanego MD5
			var hash = crypto.createHash('md5').update(pass.normalize('NFKC')).digest("hex");
			//console.log("MD5: " + hash + " (db: " + u[0][0].password + ")");
			if (u[0][0].password == hash) return true;
		} else {
			var hash = scrypt(pass.normalize('NFKC'), "animawka", 16384, 8, 1, 64).toString('hex');
			//console.log("scrypt: " + hash + " (db: " + u[0][0].password + ")");
			if (u[0][0].password == hash) return true;
		}
	}
	return false;
};

exports.name2url = name => {
	return name.replace(/\s/g, '_');
}