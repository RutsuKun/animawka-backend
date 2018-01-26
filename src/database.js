const Sequelize = require('sequelize');

var exports = module.exports = {};
var db = {};

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

}

exports.getLastEpisodes = async () => {
	var data = await db.query("SELECT * FROM episodes ORDER BY ID DESC LIMIT 6");
	var animes = [];

	for (var i = 0; i < data[0].length; i++) {
		var anime = await db.query("SELECT * FROM anime WHERE ID = '" + data[0][i].anime + "'");
		if (anime[0] && anime[0][0]) {
			anime[0][0].episode = data[0][i].episode;
			animes.push(anime[0][0]);
		}
	}
	return animes;
}

exports.name2url = name => {
	return name.replace(/\s/g, '_');
}