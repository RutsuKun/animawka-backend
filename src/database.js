const Sequelize = require('sequelize'),
	crypto = require('crypto'),
	scrypt = require('scryptsy'),
	primid = require('primid');

var generator = primid(0x1337, 0x2137, 0xdead);

var exports = module.exports = {};
var db = {};

var convertPasswords = false;
const itemsPerPage = 10; // liczba stron

exports.itemsPerPage = itemsPerPage;

// cache zrodel, nie zmienia sie czesto a lista nie jest dluga.
var sources = [];

exports.getSourceName = source => {
	if (!exports.isInt(source)) return "Nieznane źródło";

	try {
		for (var i = 0; i < sources.length; i++) {
			if (sources[i].id == source) {
				return sources[i].name;
			}
		}
	} catch (e) {
		return "Nieznane źródło";
	}
}

exports.loadData = async () => {
	sources = [];
	try {
		var data = await db.query("SELECT * FROM settings WHERE name = 'sources'");
		sources = JSON.parse(data[0][0].value).players;
	} catch (e) {
		console.error("Wystapił błąd podczas ładowania ustawień!");
		console.error(e);
	}
}

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
				exports.loadData();
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

exports.getAnimeEpisode = async (page, epnum) => {
	if (page === undefined || epnum === undefined || !exports.isInt(epnum)) {
		return {
			title: "Błąd",
			data: null,
			episodes: [],
			error: "Nie znaleziono odcinka"
		};
	}

	var name = exports.url2name(page);
	var u = await db.query("SELECT * FROM anime WHERE name=" + db.escape(name) + " OR namejap="+ db.escape(name));

	if (u[0] && u[0][0]) {
		var episode = await db.query("SELECT * FROM episodes WHERE anime = '" + db.escape(u[0][0].ID) + "' AND episode = " + db.escape(epnum));
		if (episode[0] && episode[0][0]) {
			var plrs = await db.query("SELECT * FROM players WHERE anime = '" + db.escape(u[0][0].ID) + "' AND episode = " + db.escape(epnum));
			console.log(plrs);

			if (plrs[0] && plrs[0][0]) {
				return {
					title: u[0][0].name + " - Odcinek " + epnum,
					data: u[0][0],
					episode: episode[0][0],
					players: plrs[0],
					error: ""
				};
			} else {
				return {
					title: u[0][0].name + " - Odcinek " + epnum,
					data: u[0][0],
					episode: episode[0][0],
					players: null,
					error: "Nie zuploadowano"
				};
			}
		} else {
			return {
				title: u[0][0].name + " - Odcinek " + epnum,
				data: u[0][0],
				episode: null,
				players: null,
				error: "Nie znaleziono odcinka"
			};
		}
	} else {
		return {
			title: "Błąd",
			data: null,
			episode: null,
			players: [],
			error: "Nie znaleziono anime"
		};
	}
}

exports.getAnime = async page => {
	if (page === undefined) {
		return {
			title: "Błąd",
			data: null,
			episodes: [],
			error: "Nie znaleziono anime"
		};
	}

	var name = exports.url2name(page);
	var u = await db.query("SELECT * FROM anime WHERE name=" + db.escape(name) + " OR namejap="+ db.escape(name));
	//console.log(u);
	if (u[0] && u[0][0]) {
		var eps = await db.query("SELECT * FROM episodes WHERE anime = '" + db.escape(u[0][0].ID) + "'");
		//console.log(eps[0]);
		return {
			title: u[0][0].name,
			data: u[0][0],
			episodes: eps[0],
			error: ""
		};
	} else {
		return {
			title: "Błąd",
			data: null,
			episodes: [],
			error: "Nie znaleziono anime"
		};
	}
}

// https://mariadb.com/kb/en/library/pagination-optimization/
exports.getAnimeList = async page => {
	var c = [];
	var data = [];

	if (page == 1) {
		data = await db.query("SELECT * FROM anime ORDER BY name ASC LIMIT " + itemsPerPage);
	} else {
		data = await db.query("SELECT * FROM anime ORDER BY name ASC LIMIT " + ((page - 1) * itemsPerPage) + "," + (page * itemsPerPage));
	}

	var cnt = await db.query("SELECT COUNT(ID) AS num FROM anime;");
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

exports.getUser = async user => {
	if (user === undefined) {
		return {
			data: null,
			error: "Nie znaleziono użytkownika"
		};
	}

	var u = await db.query("SELECT * FROM users WHERE ID=" + db.escape(user));
	if (u[0] && u[0][0]) {
		return {
			data: u[0][0],
			error: ""
		};
	} else {
		return {
			data: null,
			error: "Nie znaleziono użytkownika"
		};
	}
}

exports.delUser = async user => {
	if (user === undefined) {
		return {
			success: false
		};
	}
	try {
		var u = await db.query("DELETE FROM users WHERE ID=" + db.escape(user));
		console.log(u);
		return {
			success: true
		};
	} catch (e) {
		console.error(e.stack);
		return {
			success: false
		};
	}
}


exports.getUserList = async page => {
	var c = [];
	var data = [];

	if (page == 1) {
		data = await db.query("SELECT * FROM users ORDER BY login ASC LIMIT " + itemsPerPage);
	} else {
		data = await db.query("SELECT * FROM users ORDER BY login ASC LIMIT " + ((page - 1) * itemsPerPage) + "," + (page * itemsPerPage));
	}

	var cnt = await db.query("SELECT COUNT(ID) AS num FROM users;");
	var pc = Math.ceil(cnt[0][0].num / itemsPerPage);
	if (data[0].length != 0 && pc == 0) pc = 1;

	if (data[0] && cnt[0]) {
		return {
			users: data[0],
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
				uid: u[0][0].ID,
				success: true,
				admin: u[0][0].rank == 1
			};
		} else {
			var hash = scrypt(pass.normalize('NFKC'), "animawka", 16384, 8, 1, 64).toString('hex');
			//console.log("scrypt: " + hash + " (db: " + u[0][0].password + ")");
			if (u[0][0].password == hash) return {
				uid: u[0][0].ID,
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

exports.getStatus = status => {
	switch (status) {
		case 1:
			return "Zakończony";
		case 2:
			return "Zapowiedziany";
		default:
			return "Emitowany";
	}
}

exports.obfuscateId = x => {
	return generator.encode(x);
}

exports.isInt = x => {
   var y = parseInt(x, 10);
   return !isNaN(y) && x == y && x.toString() == y.toString();
}

exports.name2url = name => {
	return name.replace(/\s/g, '_');
}

exports.url2name = name => {
	return name.replace(/_/g, ' ');
}

exports.nl2br = text => {
	return text.replace(/\\r/g, '').replace(/\\n/g, '<br/>');
}