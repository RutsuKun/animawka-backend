const Sequelize = require('sequelize'),
	crypto = require('crypto'),
	scrypt = require('scryptsy');

var exports = module.exports = {};
var db = {};

var convertPasswords = false;
const itemsPerPage = 10; // liczba stron

exports.itemsPerPage = itemsPerPage;

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

// https://mariadb.com/kb/en/library/pagination-optimization/
exports.getAnimeList = async page => {
	var c = [];
	var data = [];

	if (page == 1) {
		data = await db.query("SELECT * FROM anime ORDER BY name ASC LIMIT " + itemsPerPage);
	} else {
		data = await db.query("SELECT * FROM anime ORDER BY name ASC LIMIT " + ((page - 1) * itemsPerPage) + "," + (page * itemsPerPage));
	}

	cnt = await db.query("SELECT COUNT(ID) AS num FROM anime;");
	var pc = Math.ceil(cnt[0][0].num / itemsPerPage);
	if (data[0].length != 0 && pc == 0) pc = 1;

	if (data[0] && cnt[0]) {
		return {
			animes: data[0],
			pagecount: pc,
			itemcount: cnt[0][0].num
		};
	}
}

exports.authenticate = async (user, pass) => {
	var u = await db.query("SELECT * FROM users WHERE email=" + db.escape(user) + " OR login="+ db.escape(user));
	//console.log(u);
	if (u[0] && u[0][0]) {
		if (u[0][0].password.length === 32) { // bo kurwa henicz uzyl jebanego MD5
			var hash = crypto.createHash('md5').update(pass.normalize('NFKC')).digest("hex");
			//console.log("MD5: " + hash + " (db: " + u[0][0].password + ")");
			if (u[0][0].password == hash) return {
				uid: u[0][0].uid,
				success: true,
				admin: u[0][0].rank == 1
			};
		} else {
			var hash = scrypt(pass.normalize('NFKC'), "animawka", 16384, 8, 1, 64).toString('hex');
			//console.log("scrypt: " + hash + " (db: " + u[0][0].password + ")");
			if (u[0][0].password == hash) return {
				uid: u[0][0].uid,
				success: true,
				admin: u[0][0].rank == 1
			};
		}
	}
	return {
		uid: -1,
		success: false,
		admin: false
	};
};

// utilsy

exports.isInt = x => {
   var y = parseInt(x, 10);
   return !isNaN(y) && x == y && x.toString() == y.toString();
}

exports.name2url = name => {
	return name.replace(/\s/g, '_');
}

exports.nl2br = text => {
	return text.replace(/\\r/g, '').replace(/\\n/g, '<br/>');
}