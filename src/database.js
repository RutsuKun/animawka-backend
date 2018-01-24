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