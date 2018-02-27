const Sequelize = require('sequelize'),
	config = require('./config'),
	crypto = require('crypto'),
	scrypt = require('scryptsy'),
	primid = require('primid');

var generator = primid(0x1337, 0x2137, 0xdead);

var exports = module.exports = {};
var db = {};

var convertPasswords = false;
const itemsPerPage = 10; // liczba stron
const itemsNewsPerPage = 1;
exports.itemsPerPage = itemsPerPage;
exports.itemsNewsPerPage = itemsNewsPerPage;

// cache zrodel, nie zmienia sie czesto a lista nie jest dluga.

exports.sources = [];

exports.getSourceName = source => {
	if (!exports.isInt(source)) return "Nieznane źródło";

	try {
		for (var i = 0; i < exports.sources.length; i++) {
			if (exports.sources[i].id == source) {
				return exports.sources[i].name;
			}
		}
	} catch (e) {
		console.error(e.stack);
		return "Nieznane źródło";
	}
}

exports.getAnimeType = type => {
	if (type == null || type == undefined) return "";
	switch (type) {
		case 0: return "";
		case 1: return "Specjalny";
		case 2: return "OVA";
		case 3: return "ONA";
		case 4: return "Film";
	}
}

exports.loadData = async () => {
	try {
		var data = await db.query("SELECT * FROM settings WHERE name = 'sources'");
		exports.sources = JSON.parse(data[0][0].value).players;
	} catch (e) {
		console.error("Wystapił błąd podczas ładowania ustawień!");
		console.error(e.stack);
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

exports.getAnimeEpisode = async (anime, epnum) => {
	if (anime === undefined || epnum === undefined || !exports.isInt(epnum)) {
		return {
			title: "Błąd",
			data: null,
			episodes: [],
			error: "Nie znaleziono odcinka"
		};
	}

	var name = exports.url2name(anime);
	var u = await db.query("SELECT * FROM anime WHERE name=" + db.escape(name) + " OR namejap="+ db.escape(name));

	if (u[0] && u[0][0]) {
		var episode = await db.query("SELECT * FROM episodes WHERE anime = '" + db.escape(u[0][0].ID) + "' AND episode = " + db.escape(epnum));
		if (episode[0] && episode[0][0]) {
			if (episode[0][0].override) {
				epnum = exports.getAnimeType(episode[0][0].type) + " " + episode[0][0].override;
			}
			var plrs = await db.query("SELECT * FROM players WHERE anime = '" + db.escape(u[0][0].ID) + "' AND episode = " + db.escape(epnum));
			console.log(epnum);
			if(epnum === '0'){
				if (plrs[0] && plrs[0][0]) {
					return {
						title: u[0][0].name + " - Zapowiedź",
						data: u[0][0],
						episode: episode[0][0],
						players: plrs[0],
						error: ""
					};
				} else {
					return {
						title: u[0][0].name + " - Zapowiedź",
						data: u[0][0],
						episode: episode[0][0],
						players: null,
						error: "Nie zuploadowano"
					};
				}
			} else {
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

exports.delAnimeEpisode = async (anime, episode) => {
	if (anime === undefined || episode === undefined || !exports.isInt(episode)) {
		return {
			success: false
		};
	}
	try {
		var name = exports.url2name(anime);
		var date = new Date().toISOString().substring(0, 10);
		var u = await db.query("SELECT * FROM anime WHERE name=" + db.escape(name) + " OR namejap=" + db.escape(name) + " OR ID=" + db.escape(anime));
		if (u[0] && u[0][0]) {
			await db.query("DELETE FROM episodes WHERE anime = '" + db.escape(u[0][0].ID) + "' AND episode = " + db.escape(episode));
			return {
				success: true
			};
		} else {
			return {
				success: false
			};
		}
	} catch (e) {
		console.error(e.stack);
		return {
			success: false
		};
	}
}

exports.editAnimeEpisode = async (anime, episode, body) => {
	if (anime === undefined || episode === undefined || !exports.isInt(episode)) {
		return {
			success: false
		};
	}
	try {
		var name = exports.url2name(anime);
		var date = new Date().toISOString().substring(0, 10);
		var u = await db.query("SELECT * FROM anime WHERE name=" + db.escape(name) + " OR namejap=" + db.escape(name) + " OR ID=" + db.escape(anime));
		if (u[0] && u[0][0]) {
			await db.query("UPDATE episodes SET episode=" + db.escape(body.episodenum) + ", name=" + db.escape(body.name) + ", override=" + db.escape(body.override) + ", type=" + db.escape(body.type) + " WHERE anime = '" + db.escape(u[0][0].ID) + "' AND episode = " + db.escape(episode));
			if (body.players) {
				var players = JSON.parse(body.players).players;
				if (players) {
					var oldplrs = await db.query("SELECT * FROM players WHERE anime = '" + db.escape(u[0][0].ID) + "' AND episode = " + db.escape(body.episodenum));
					await db.query("DELETE FROM players WHERE anime = '" + db.escape(u[0][0].ID) + "' AND episode = " + db.escape(body.episodenum));
					var cnt = await db.query("SELECT MAX(ID) AS num FROM players;");
					var id = cnt[0][0].num + 1;
					for (var i = 0; i < players.length; i++) {
						if (players[i].ID) {
							await db.query("INSERT INTO players (ID, user, anime, episode, url, type, date) VALUES (" + db.escape(players[i].ID) + ", " + db.escape(players[i].user) + ", " + db.escape(u[0][0].ID) + ", " + db.escape(body.episodenum) + ", " + db.escape(players[i].url) + ", " +  db.escape(players[i].type) + ", " + db.escape(players[i].date) + ");");
						} else {
							await db.query("INSERT INTO players (ID, user, anime, episode, url, type, date) VALUES (" + db.escape(id + 1) + ", " + db.escape(body.user) + ", " + db.escape(u[0][0].ID) + ", " + db.escape(body.episodenum) + ", " + db.escape(players[i].url) + ", " +  db.escape(players[i].type) + ", " + db.escape(date) + ");");
							id++;
						}
					}
				}
			}
			return {
				success: true
			};
		} else {
			return {
				success: false
			};
		}
	} catch (e) {
		console.error(e.stack);
		return {
			success: false
		};
	}
};


exports.newAnimeEpisode = async (anime, body) => {
	if (anime === undefined) {
		return {
			success: false
		};
	}

	console.log("Anime: "+anime+" Body: "+body);

	try {

		var date = new Date().toISOString().substring(0, 10);
		var u = await db.query("SELECT * FROM anime WHERE ID =" + db.escape(anime));
		if (u[0] && u[0][0]) {
			var epid = await db.query("SELECT MAX(ID) AS num FROM episodes;");
			await db.query("INSERT INTO episodes (ID, episode, name, user, anime, date, type, override) VALUES (" + db.escape(epid[0][0].num + 1) + ", " + db.escape(body.episodenum) + ", " + db.escape(body.name) + ", " + db.escape(body.user) + ", " + db.escape(u[0][0].ID) + ", " + db.escape(date) + ", " + db.escape(body.type) + ", " + db.escape(body.override) + ")");
			if (body.players) {
				var players = JSON.parse(body.players).players;
				if (players) {
					var cnt = await db.query("SELECT MAX(ID) AS num FROM players;");
					var id = cnt[0][0].num + 1;
					for (var i = 0; i < players.length; i++) {
						await db.query("INSERT INTO players (ID, user, anime, episode, url, type, date) VALUES (" + db.escape(id) + ", " + db.escape(body.user) + ", " + db.escape(u[0][0].ID) + ", " + db.escape(body.episodenum) + ", " + db.escape(players[i].url) + ", " +  db.escape(players[i].type) + ", " + db.escape(date) + ");");
						id++;
					}
				}
			}
			return {
				success: true
			};
		} else {
			return {
				success: false
			};
		}
	} catch (e) {
		console.error(e.stack);
		return {
			success: false
		};
	}
};

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
	var u = await db.query("SELECT * FROM anime WHERE name=" + db.escape(name) + " OR namejap="+ db.escape(name) +" OR ID = "+ db.escape(name));
	//console.log(u);
	if (u[0] && u[0][0]) {
		var eps = await db.query("SELECT * FROM episodes WHERE anime = '" + db.escape(u[0][0].ID) + "' ORDER BY episode ASC");
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

exports.delAnime = async anime => {
	if (anime === undefined) {
		return {
			success: false
		};
	}
	try {
		var u = await db.query("DELETE FROM anime WHERE ID=" + db.escape(anime));
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

exports.editAnime = async animedata => {
	console.log(animedata);
	if (animedata === undefined) {
		return {
			success: false
		};
	}
	try {
		var translators = "";
		if (Array.isArray(animedata.translators))
			translators = animedata.translators.join(", ");
		else
			translators = animedata.translators;
		var correctors = "";
		if (Array.isArray(animedata.correctors))
			correctors = animedata.correctors.join(", ");
		else
			correctors = animedata.correctors;

		if (!animedata.nsfw) animedata.nsfw = 0;
		if (!animedata.image) animedata.image = "";

		var u = await db.query("UPDATE anime SET name=" + db.escape(animedata.name)
								+ ", namejap=" + db.escape(animedata.namejap)
								+ ", nameeng=" + db.escape(animedata.nameeng)
								+ ", episodes=" + db.escape(animedata.episodes)
								+ ", translate=" + db.escape(animedata.translate)
								+ ", corrector=" + db.escape(animedata.corrector)
								+ ", description=" + db.escape(animedata.description)
								+ ", image=" + db.escape(animedata.image)
								+ ", tags=" + db.escape(animedata.tags)
								+ ", mal=" + db.escape(animedata.mal)
								+ ", studio=" + db.escape(animedata.studio)
								+ ", episodelen=" + db.escape(animedata.episodelen)
								+ ", emission=" + db.escape(animedata.emission)
								+ ", season=" + db.escape(animedata.season)
								+ ", seasonyear=" + db.escape(animedata.seasonyear)
								+ ", nsfw=" + db.escape(animedata.nsfw)
								+ ", status=" + db.escape(animedata.status)
								+ " WHERE ID=" + db.escape(animedata.ID));
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


exports.newAnime = async animedata => {
	if (animedata === undefined) {
		return {
			success: false
		};
	}
	try {
		var translators = "";
		if (Array.isArray(animedata.translators))
			translators = animedata.translators.join(", ");
		else
			translators = animedata.translators;
		var correctors = "";
		if (Array.isArray(animedata.correctors))
			correctors = animedata.correctors.join(", ");
		else
			correctors = animedata.correctors;

		if (!animedata.nsfw) animedata.nsfw = 0;
		if (!animedata.image) animedata.image = "";
		if (!animedata.translate) animedata.translate = "";
		if (!animedata.corrector) animedata.corrector = "";

		var u = await db.query("INSERT INTO anime (name, user, namejap, episodes, translate, corrector, description, image, tags, nsfw, status) VALUES"
								+ "(" + db.escape(animedata.name)
								+ ", " + db.escape(animedata.user)
								+ ", " + db.escape(animedata.namejap)
								+ ", " + db.escape(animedata.episodes)
								+ ", " + db.escape(animedata.translate)
								+ ", " + db.escape(animedata.corrector)
								+ ", " + db.escape(animedata.description)
								+ ", " + db.escape(animedata.image)
								+ ", " + db.escape(animedata.tags)
								+ ", " + db.escape(animedata.nsfw)
								+ ", " + db.escape(animedata.status) + ")");
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

// https://mariadb.com/kb/en/library/pagination-optimization/

// NEWS SYSTEM BY HENIOOO //

exports.getNewsList = async page => {
	var c = [];
	var data = [];

	if (page == 1) {
		data = await db.query("SELECT * FROM news ORDER BY ID DESC LIMIT " + itemsPerPage);
	} else {
		data = await db.query("SELECT * FROM news ORDER BY ID DESC LIMIT " + ((page - 1) * itemsPerPage) + "," + (page * itemsPerPage));
	}

	var cnt = await db.query("SELECT COUNT(ID) AS num FROM news;");
	var pc = Math.ceil(cnt[0][0].num / itemsPerPage);
	if (data[0].length != 0 && pc == 0) pc = 1;

	if (data[0] && cnt[0]) {
		return {
			news: data[0],
			pagecount: pc,
			itemcount: cnt[0][0].num
		};
	}
}

exports.newNews = async newsdata => {
	if (newsdata === undefined) {
		return {
			success: false
		};
	}
	try {

		if (!newsdata.image) newsdata.image = "";

		var u = await db.query("INSERT INTO news (title, user, content, image, tags, type) VALUES"
								+ "(" + db.escape(newsdata.title)
								+ ", " + db.escape(newsdata.user)
								+ ", " + db.escape(newsdata.content)
								+ ", " + db.escape(newsdata.image)
								+ ", " + db.escape(newsdata.tags)
								+ ", " + db.escape(newsdata.type)+")");
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

exports.getNews = async id => {
	if (id === undefined) {
		return {
			title: "Błąd",
			data: null,
			episodes: [],
			error: "Nie znaleziono newsa"
		};
	}


	var u = await db.query("SELECT * FROM news WHERE ID=" + db.escape(id));
	console.log(u);
	if (u[0] && u[0][0]) {

		return {
			title: u[0][0].title,
			data: u[0][0],
			error: ""
		};
	} else {
		return {
			title: "Błąd",
			data: null,
			episodes: [],
			error: "Nie znaleziono newsa"
		};
	}
}

exports.editNews = async newsdata => {
	if (newsdata === undefined) {
		return {
			success: false
		};
	}
	try {

		if (!newsdata.image) newsdata.image = "";

		var u = await db.query("UPDATE news SET title=" + db.escape(newsdata.title)
								+ ", content=" + db.escape(newsdata.content)
								+ ", image=" + db.escape(newsdata.image)
								+ ", tags=" + db.escape(newsdata.tags)
								+ ", type=" + db.escape(newsdata.type)
								+ " WHERE ID = " + db.escape(newsdata.ID));
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

exports.delNews = async news => {
	if (news === undefined) {
		return {
			success: false
		};
	}
	try {
		var u = await db.query("DELETE FROM news WHERE ID=" + db.escape(news));
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

exports.getLastNews = async page => {
	var c = [];
	var data = [];

	if (page == 1) {
		data = await db.query("SELECT * FROM news ORDER BY ID DESC LIMIT " + itemsNewsPerPage);
	} else {
		data = await db.query("SELECT * FROM news ORDER BY ID DESC LIMIT " + ((page - 1) * itemsNewsPerPage) + "," + (page * itemsNewsPerPage));
	}

	var cnt = await db.query("SELECT COUNT(ID) AS num FROM news;");
	var pc = Math.ceil(cnt[0][0].num / itemsPerPage);
	if (data[0].length != 0 && pc == 0) pc = 1;

	if (data[0] && cnt[0]) {
		return {
			news: data[0],
			pagecount: pc,
			itemcount: cnt[0][0].num
		};
	}
}

// NEWS SYSTEM BY HENIOOO //


// REVIEWS SYSTEM BY HENIOOO //

exports.getReviewsList = async page => {
	var c = [];
	var data = [];

	if (page == 1) {
		data = await db.query("SELECT * FROM reviews ORDER BY ID DESC LIMIT " + itemsPerPage);
	} else {
		data = await db.query("SELECT * FROM reviews ORDER BY ID DESC LIMIT " + ((page - 1) * itemsPerPage) + "," + (page * itemsPerPage));
	}

	var cnt = await db.query("SELECT COUNT(ID) AS num FROM news;");
	var pc = Math.ceil(cnt[0][0].num / itemsPerPage);
	if (data[0].length != 0 && pc == 0) pc = 1;

	if (data[0] && cnt[0]) {
		return {
			reviews: data[0],
			pagecount: pc,
			itemcount: cnt[0][0].num
		};
	}
}

exports.newReview = async reviewsdata => {
	if (reviewsdata === undefined) {
		return {
			success: false
		};
	}
	try {

		if (!reviewsdata.image) reviewsdata.image = "";

		var u = await db.query("INSERT INTO reviews (title, user, content, image, yt, tags, type) VALUES"
								+ "(" + db.escape(reviewsdata.title)
								+ ", " + db.escape(reviewsdata.user)
								+ ", " + db.escape(reviewsdata.content)
								+ ", " + db.escape(reviewsdata.image)
								+ ", " + db.escape(reviewsdata.yt)
								+ ", " + db.escape(reviewsdata.tags)
								+ ", " + db.escape(reviewsdata.type)+")");
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

exports.getReview = async id => {
	if (id === undefined) {
		return {
			title: "Błąd",
			data: null,
			episodes: [],
			error: "Nie znaleziono recenzji"
		};
	}


	var u = await db.query("SELECT * FROM reviews WHERE ID=" + db.escape(id));
	console.log(u);
	if (u[0] && u[0][0]) {

		return {
			title: u[0][0].title,
			data: u[0][0],
			error: ""
		};
	} else {
		return {
			title: "Błąd",
			data: null,
			error: "Nie znaleziono newsa"
		};
	}
}

exports.editReview = async reviewdata => {
	if (reviewdata === undefined) {
		return {
			success: false
		};
	}
	try {

		if (!reviewdata.image) newsdata.image = "";

		var u = await db.query("UPDATE reviews SET title=" + db.escape(reviewdata.title)
								+ ", content=" + db.escape(reviewdata.content)
								+ ", image=" + db.escape(reviewdata.image)
								+ ", tags=" + db.escape(reviewdata.tags)
								+ ", type=" + db.escape(reviewdata.type)
								+ " WHERE ID = " + db.escape(reviewdata.ID));
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

exports.delReview = async review => {
	if (review === undefined) {
		return {
			success: false
		};
	}
	try {
		var u = await db.query("DELETE FROM reviews WHERE ID=" + db.escape(review));
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

// REVIEWS SYSTEM BY HENIOOO //


// CONFIG BY HENIOOO //

exports.getConfig = async () => {

	var u = await db.query("SELECT * FROM settings");

	if (u[0] && u[0][0]) {
//console.log(u[0][0]);
		return {
			data: u[0][0],
			debug: u[0][0],
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

// CONFIG BY HENIOOO //


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


exports.getUserLogin = async user => {
	var u = await db.query("SELECT * FROM users WHERE ID = " + db.escape(user));
	return u[0][0].login ? u[0][0].login : null; //bo moze wyjebac ;) 
}


exports.getUsersByRank = async (rank, includeadmins) => {
	if (rank === undefined) {
		return {
			data: [],
			error: "Nie znaleziono użytkowników"
		};
	}
	var u = {};
	if (includeadmins)
		u = await db.query("SELECT * FROM users WHERE rank=" + db.escape(rank) + " OR rank='1'");
	else
		u = await db.query("SELECT * FROM users WHERE rank=" + db.escape(rank));

	if (u[0]) {
		return {
			data: u[0],
			error: ""
		};
	} else {
		return {
			data: [],
			error: "Nie znaleziono użytkowników"
		};
	}
}

exports.editUser = async userdata => {
	if (userdata === undefined) {
		return {
			success: false
		};
	}
	try {

		var u = await db.query("UPDATE users SET name=" + db.escape(userdata.name)
								+ ", login=" + db.escape(userdata.login)
								+ ", email=" + db.escape(userdata.email)
								+ ", rank=" + db.escape(userdata.rank)
								+ " WHERE ID=" + db.escape(userdata.ID));
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

exports.delUser = async user => {
	if (user === undefined) {
		return {
			success: false
		};
	}
	try {
		var u = await db.query("DELETE FROM users WHERE ID=" + db.escape(user));
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
		data = await db.query("SELECT * FROM users ORDER BY ID ASC LIMIT " + itemsPerPage);
	} else {
		data = await db.query("SELECT * FROM users ORDER BY ID ASC LIMIT " + ((page - 1) * itemsPerPage) + "," + (page * itemsPerPage));
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
			console.log("MD5: " + hash + " (db: " + u[0][0].password + ")");

			if (u[0][0].password == hash) {
				if (config.cfg["convert-passwords"]) {
					var hashnew = scrypt(pass.normalize('NFKC'), "animawka", 16384, 8, 1, 64).toString('hex');
					var u2 = await db.query("UPDATE users SET password=" + db.escape(hashnew) + " WHERE ID = " + db.escape(u[0][0].ID));
					console.log("update pass [" + pass + "] " + hash + " -> " + hashnew);
				}

				return {
					uid: u[0][0].ID,
					success: true,
					admin: u[0][0].rank == 1
				};
			}
		} else {
			var hash = scrypt(pass.normalize('NFKC'), "animawka", 16384, 8, 1, 64).toString('hex');
			console.log("scrypt: " + hash + " (db: " + u[0][0].password + ")");
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
			return "Zakończone";
		case 2:
			return "Zapowiedziane";
		default:
			return "Emitowane";
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
