const express = require('express'),
	db = require('./database'),
	theme = require('./theme'),
	server = require('./server'),
	config = require('./config');
var BBCodeParser = require('bbcode-parser');

var parser = new BBCodeParser(BBCodeParser.defaultTags());
var BBTag = require('bbcode-parser/bbTag');
var bbTags = {};

var router = express.Router();


router.get('/', function(req, res, next) {
	db.getLastEpisodes().then(eps => {
		db.getLastNews(1).then(newslist => {
	 	var html = parser.parseString(newslist.news[0].content);
		console.log(newslist.news);
			db.getUser(newslist.news[0].user).then(async user => {
		
//bbcode.parse('[b]text[/b]', function(content) {});
		
				//console.log(user);
				if (eps === undefined) eps = [];
				res.render('index', {
					theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
					themes: theme.themes,
					title: 'Strona główna',
					db: db, 
					session: req.session, 
					anime: eps,
					news:newslist,
					newscontent:html,
					user:user
				});
			});
		});
	});
});

router.get('/anime/:name/:episode', function(req, res, next) {
	db.getAnimeEpisode(req.params.name, req.params.episode).then(anime => {
			db.getUserLogin(anime.data.user).then(user => {
		console.log(anime.title);
		res.render('animewatch', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: anime.title,
			data: anime.data,
			episode: anime.episode,
			players: anime.players,
			user:user,
			error: anime.error,
			db: db, 
			session: req.session
		});
		});
	});
});

router.get('/anime/:name', function(req, res, next) {
	if (db.isInt(req.params.name)) {
		db.getAnimeList(req.params.name).then(animelist => {
		console.log(db.getUserLogin(1));
			res.render('animelist', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Lista anime',
				page: req.params.name,
				animelist: animelist,
				db: db, 
				session: req.session
			});
		});
	} else {
		db.getAnime(req.params.name).then(anime => {
		db.getUserLogin(anime.data.user).then(async user => {
			res.render('animeinfo', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: anime.title,
				data: anime.data,
				user:user,
				episodes: anime.episodes,
				error: anime.error,
				db: db, 
				session: req.session
			});
		});
		});
	}
});

router.get('/anime', function(req, res, next) {
	db.getAnimeList(1).then(animelist => {
		res.render('animelist', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Lista anime',
			page: 1,
			animelist: animelist,
			db: db, 
			session: req.session
		});
	});
});

router.get('/wyloguj', function(req, res, next) {
	req.session.destroy();

	res.render('logout', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		themes: theme.themes,
		title: 'Wylogowano',
		db: db, 
		session: req.session
	});
});

router.post('/zaloguj', async function(req, res, next) {
	var captcha = false;
	var ss = {success: false, admin: false, uid: -1};

	if (server.recaptcha != null) {
		try {
			await server.recaptcha.validateRequest(req);
			try {
				if (req.body.login && req.body.login != '' && req.body.password && req.body.password != '') {
					ss = await db.authenticate(req.body.login, req.body.password);
				}
			} catch (e) {
				console.log(e);
				ss.success = false;
			}
		} catch (e) {
			ss.success = false;
			captcha = true;
		}
		
	} else {
		try {
			if (req.body.login && req.body.login != '' && req.body.password && req.body.password != '')
				ss = await db.authenticate(req.body.login, req.body.password);
		} catch (e) {
			console.log(e);
			ss.success = false;
		}
	}

	if (ss.success) {
		req.session.authorized = true;
		req.session.uid = ss.uid;
		req.session.admin = ss.admin;
		var time = 2592000000;
		req.session.cookie.expires = new Date(Date.now() + time);
		req.session.cookie.maxAge = time;
	}

	res.render('login', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		title: 'Logowanie',
		themes: theme.themes,
		db: db,
		session: req.session,
		login: true,
		success: ss.success,
		captcha: captcha,
		enableCaptcha: config.cfg.recaptcha.enable
	});
});

router.get('/zaloguj', function(req, res, next) {	
	res.render('login', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		title: 'Logowanie',
		themes: theme.themes,
		db: db,
		session: req.session,
		login: false,
		success: false,
		captcha: false,
		enableCaptcha: config.cfg.recaptcha.enable
	});
});


router.get('/zarejestruj', function(req, res, next) {
	res.render('register', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		themes: theme.themes,
		title: 'Rejestracja',
		db: db, 
		session: req.session
	});
});


router.get('/chat', function(req, res, next) {	
	res.render('chat', {
		messages: server.messages
	});
});


router.get('/kontakt', (req, res, next) => {
		res.render('contact', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Kontakt',
			db: db, 
			session: req.session
		});
});

router.get('/regulamin', (req, res, next) => {
		res.render('rules', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Regulamin',
			db: db, 
			session: req.session
		});
});

router.get('/casting', (req, res, next) => {
		res.render('casting', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Casting do Dubbingu Euphoria',
			db: db, 
			session: req.session
		});
});

//////////////////////////////////////////////////////////////////////////////////

router.get('/admin', (req, res, next) => {
	if (req.session && req.session.admin) {
		res.render('admin/home', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Panel administracyjny',
			db: db, 
			session: req.session
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/accounts', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getUserList(1).then(userlist => {
			res.render('admin/accountlist', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Konta',
				page: 1,
				userlist: userlist,
				db: db,
				session: req.session,
				message: undefined
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/accounts/:page', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getUserList(req.params.page).then(userlist => {
			res.render('admin/accountlist', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Konta',
				page: req.params.page,
				userlist: userlist,
				db: db,
				session: req.session,
				message: undefined
			});
		});
	} else {
		noPerm(req, res, next);
	}
});


router.get('/admin/anime', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getAnimeList(1).then(animelist => {
			res.render('admin/animelist', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Anime',
				page: 1,
				animelist: animelist,
				db: db,
				session: req.session,
				message: undefined
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/anime/:page', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getAnimeList(req.params.page).then(animelist => {
			res.render('admin/animelist', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Anime',
				page: req.params.page,
				animelist: animelist,
				db: db,
				session: req.session,
				message: undefined
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/editaccount/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getUser(req.params.id).then(user => {
			res.render('admin/editaccount', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Edycja uzytkownika',
				page: req.params.page,
				user: user,
				db: db, 
				session: req.session
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.post('/admin/editaccount/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		if (req.body.action === "delete") {
			if (req.session.uid == req.params.id) {
				db.getUserList(1).then(userlist => {
					res.render('admin/accountlist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Konta',
						page: 1,
						userlist: userlist,
						db: db,
						session: req.session,
						message: "Nie możesz usunąć własnego konta!"
					});
				});
			} else {
				console.log(req.session.uid);
				console.log(req.params.id);
				db.delUser(req.params.id).then(user => {
					db.getUserList(1).then(userlist => {
						res.render('admin/accountlist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Konta',
							page: 1,
							userlist: userlist,
							db: db,
							session: req.session,
							message: "Użytkownik usunięty!"
						});
					});
				});
			}
		} else if (req.body.action == "edit") {
			db.editUser(req.body).then(data => {
				if (data.success) {
					db.getUserList(1).then(userlist => {
						res.render('admin/accountlist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Konta',
							page: 1,
							userlist: userlist,
							db: db,
							session: req.session,
							message: "Konto zedytowane!"
						});
					});
				} else {
					db.getAnimeList(1).then(animelist => {
						res.render('admin/accountlist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Konta',
							page: 1,
							userlist: userlist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas edytowania konta!"
						});
					});
				}
			});
		}
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/editanime/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getAnime(req.params.id).then(anime => {
			db.getUser(anime.data.user).then(async user => {
				var translators = await db.getUsersByRank(2, true);
				var correctors = await db.getUsersByRank(3, true);
				res.render('admin/editanime', {
					theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
					themes: theme.themes,
					title: 'Edycja anime',
					page: req.params.page,
					anime: anime,
					user: user,
					db: db, 
					session: req.session,
					translators: translators,
					correctors: correctors
				});
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/listepisodes/:id', (req, res, next) => {
	if(req.session && req.session.admin) {
		db.getAnime(req.params.id).then(anime => {
			res.render('admin/episodelist', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: anime.title,
				data: anime.data,
				episodes: anime.episodes,
				error: anime.error,
				db: db,
				anime: anime,
				session: req.session
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.post('/admin/editanime/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		//console.log(req.body);
		if (req.body.action === "delete") {
			db.delAnime(req.params.id).then(data => {
				if (data.success) {
					db.getAnimeList(1).then(animelist => {
						res.render('admin/animelist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Anime',
							page: 1,
							animelist: animelist,
							db: db,
							session: req.session,
							message: "Anime zostało usunięte!"
						});
					});
				} else {
					db.getAnimeList(1).then(animelist => {
						res.render('admin/animelist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Anime',
							page: 1,
							animelist: animelist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas usuwania anime!"
						});
					});
				}
			});
		} else if (req.body.action == "edit") {
			db.editAnime(req.body).then(data => {
				if (data.success) {
					db.getAnimeList(1).then(animelist => {
						res.render('admin/animelist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Anime',
							page: 1,
							animelist: animelist,
							db: db,
							session: req.session,
							message: "Zmiany zostały zapisane!"
						});
					});
				} else {
					db.getAnimeList(1).then(animelist => {
						res.render('admin/animelist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Anime',
							page: 1,
							animelist: animelist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas edytowania anime!"
						});
					});
				}
			});
		}
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/newanime', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getUser(req.session.uid).then(async user => {
			var translators = await db.getUsersByRank(2, true);
			var correctors = await db.getUsersByRank(3, true);
			res.render('admin/newanime', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Nowe anime',
				page: req.params.page,
				user: user,
				db: db, 
				session: req.session,
				translators: translators,
				correctors: correctors
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.post('/admin/newanime', (req, res, next) => {
	if (req.session && req.session.admin) {
		console.log(req.body);
		db.newAnime(req.body).then(data => {
			if (data.success) {
				db.getAnimeList(1).then(animelist => {
					res.render('admin/animelist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Anime',
						page: 1,
						animelist: animelist,
						db: db,
						session: req.session,
						message: "Zmiany zostały zapisane!"
					});
				});
			} else {
				db.getAnimeList(1).then(animelist => {
					res.render('admin/animelist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Anime',
						page: 1,
						animelist: animelist,
						db: db,
						session: req.session,
						message: "Wystąpił błąd podczas dodawania anime!"
					});
				});
			}
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/editepisode/:id/:num', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getAnimeEpisode(req.params.id, req.params.num).then(anime => {
			db.getUser(anime.data.user).then(async user => {
				var translators = await db.getUsersByRank(2, true);
				var correctors = await db.getUsersByRank(3, true);
				res.render('admin/editepisode', {
					theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
					themes: theme.themes,
					title: 'Edycja odcinka',
					page: req.params.page,
					anime: anime,
					user: user,
					db: db, 
					session: req.session,
					translators: translators,
					correctors: correctors
				});
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/newepisode/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getAnime(req.params.id).then(anime => {
			db.getUser(req.session.uid).then(async user => {
				var translators = await db.getUsersByRank(2, true);
				var correctors = await db.getUsersByRank(3, true);
				res.render('admin/newepisode', {
					theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
					themes: theme.themes,
					title: 'Nowy odcinek',
					page: req.params.page,
					anime: anime,
					user: user,
					db: db, 
					session: req.session,
					translators: translators,
					correctors: correctors
				});
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.post('/admin/editepisode/:id/:num', (req, res, next) => {
	if (req.session && req.session.admin) {
		req.body.user = req.session.uid;
		if (req.body.action == "edit") {
			db.editAnimeEpisode(req.params.id, req.params.num, req.body).then(data => {
				if (data.success) {
					db.getAnimeList(1).then(animelist => {
						res.render('admin/animelist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Anime',
							page: 1,
							animelist: animelist,
							db: db,
							session: req.session,
							message: "Zmiany zostały zapisane!"
						});
					});
				} else {
					db.getAnimeList(1).then(animelist => {
						res.render('admin/animelist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Anime',
							page: 1,
							animelist: animelist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas edytowania odcinka!"
						});
					});
				}
			});
		} else if (req.body.action == "delete") {
			db.delAnimeEpisode(req.params.id, req.params.num).then(data => {
				if (data.success) {
					db.getAnimeList(1).then(animelist => {
						res.render('admin/animelist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Anime',
							page: 1,
							animelist: animelist,
							db: db,
							session: req.session,
							message: "Odcinek został usunięty!"
						});
					});
				} else {
					db.getAnimeList(1).then(animelist => {
						res.render('admin/animelist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Anime',
							page: 1,
							animelist: animelist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas edytowania odcinka!"
						});
					});
				}
			});
		}
	} else {
		noPerm(req, res, next);
	}
});


router.post('/admin/newepisode/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		req.body.user = req.session.uid;
		db.newAnimeEpisode(req.params.id, req.body).then(data => {
			if (data.success) {
				db.getAnimeList(1).then(animelist => {
					res.render('admin/animelist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Anime',
						page: 1,
						animelist: animelist,
						db: db,
						session: req.session,
						message: "Zmiany zostały zapisane!"
					});
				});
			} else {
				db.getAnimeList(1).then(animelist => {
					res.render('admin/animelist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Anime',
						page: 1,
						animelist: animelist,
						db: db,
						session: req.session,
						message: "Wystąpił błąd podczas dodawania odcinka!"
					});
				});
			}
		});
	} else {
		noPerm(req, res, next);
	}
});

// NEWS SYSTEM BY HENIOOO//

router.get('/admin/news', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getNewsList(1).then(newslist => {
		console.log(newslist);
			res.render('admin/newslist', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Aktualności',
				page: 1,
				newslist: newslist,
				db: db,
				session: req.session,
				message: undefined
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/newnews', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getUser(req.session.uid).then(async user => {
			res.render('admin/newnews', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Nowy news',
				page: req.params.page,
				user: user,
				db: db, 
				session: req.session
			});
		});
	} else {
		noPerm(req, res, next);
	}
});


router.post('/admin/newnews', (req, res, next) => {
	if (req.session && req.session.admin) {
		console.log(req.body);
		db.newNews(req.body).then(data => {
			if (data.success) {
				db.getNewsList(1).then(newslist => {
					res.render('admin/newslist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Aktualności',
						page: 1,
						newslist: newslist,
						db: db,
						session: req.session,
						message: "Dodano newsa!"
					});
				});
			} else {
				db.getNewsList(1).then(newslist => {
					res.render('admin/newslist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Aktualności',
						page: 1,
						newslist: newslist,
						db: db,
						session: req.session,
						message: "Wystąpił błąd podczas dodawania newsa!"
					});
				});
			}
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/editnews/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getNews(req.params.id).then(news => {
			db.getUser(news.data.user).then(async user => {

				res.render('admin/editnews', {
					theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
					themes: theme.themes,
					title: 'Edycja newsa',
					page: req.params.page,
					news: news,
					user: user,
					db: db, 
					session: req.session
				});
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.post('/admin/editnews/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		console.log(req.body);
		if (req.body.action === "delete") {
			db.delNews(req.params.id).then(data => {
				if (data.success) {
					db.getNewsList(1).then(newslist => {
						res.render('admin/newslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Aktualności',
							page: 1,
							newslist: newslist,
							db: db,
							session: req.session,
							message: "News został usunięty!"
						});
					});
				} else {
					db.getNewsList(1).then(newslist => {
						res.render('admin/newslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Aktualności',
							page: 1,
							newslist: newslist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas usuwania newsa!"
						});
					});
				}
			});
		} else if (req.body.action == "edit") {
			db.editNews(req.body).then(data => {
				if (data.success) {
					db.getNewsList(1).then(newslist => {
						res.render('admin/newslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Aktualności',
							page: 1,
							newslist: newslist,
							db: db,
							session: req.session,
							message: "Zmiany zostały zapisane!"
						});
					});
				} else {
					db.getNewsList(1).then(newslist => {
						res.render('admin/newslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Aktualności',
							page: 1,
							animelist: animelist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas edytowania newsa!"
						});
					});
				}
			});
		}
	} else {
		noPerm(req, res, next);
	}
});

// NEWS SYSTEM BY HENIOOO//

// REVIEWS SYSTEM BY HENIOOO//

router.get('/admin/reviews', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getReviewsList(1).then(reviewslist => {
			res.render('admin/reviewslist', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Recenzje',
				page: 1,
				reviewslist: reviewslist,
				db: db,
				session: req.session,
				message: undefined
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/newreview', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getUser(req.session.uid).then(async user => {
			res.render('admin/newreview', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Nowa recenzja',
				page: req.params.page,
				user: user,
				db: db, 
				session: req.session
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.post('/admin/newreview', (req, res, next) => {
	if (req.session && req.session.admin) {
		console.log(req.body);
		db.newReview(req.body).then(data => {
			if (data.success) {
				db.getReviewsList(1).then(reviewslist => {
					res.render('admin/reviewslist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Recenzje',
						page: 1,
						reviewslist: reviewslist,
						db: db,
						session: req.session,
						message: "Dodano recenzje!"
					});
				});
			} else {
				db.getReviewsList(1).then(reviewslist => {
					res.render('admin/reviewslist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Recenzje',
						page: 1,
						reviewslist: reviewslist,
						db: db,
						session: req.session,
						message: "Wystąpił błąd podczas dodawania recenzji!"
					});
				});
			}
		});
	} else {
		noPerm(req, res, next);
	}
});

router.get('/admin/editreview/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getReview(req.params.id).then(review => {
			db.getUser(review.data.user).then(async user => {

				res.render('admin/editreview', {
					theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
					themes: theme.themes,
					title: 'Edycja recenzji',
					page: req.params.page,
					review: review,
					user: user,
					db: db, 
					session: req.session
				});
			});
		});
	} else {
		noPerm(req, res, next);
	}
});

router.post('/admin/editreview/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		console.log(req.body);
		if (req.body.action === "delete") {
			db.delReview(req.params.id).then(data => {
				if (data.success) {
					db.getReviewsList(1).then(reviewslist => {
						res.render('admin/reviewslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Recenzje',
							page: 1,
							reviewslist: reviewslist,
							db: db,
							session: req.session,
							message: "Recenzja została usunięta!"
						});
					});
				} else {
					db.getReviewsList(1).then(reviewslist => {
						res.render('admin/reviewslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Recenzje',
							page: 1,
							reviewslist: reviewslist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas usuwania recenzji!"
						});
					});
				}
			});
		} else if (req.body.action == "edit") {
			db.editReview(req.body).then(data => {
				if (data.success) {
					db.getReviewsList(1).then(reviewslist => {
						res.render('admin/reviewslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Recenzje',
							page: 1,
							reviewslist: reviewslist,
							db: db,
							session: req.session,
							message: "Zmiany zostały zapisane!"
						});
					});
				} else {
					db.getReviewsList(1).then(reviewslist => {
						res.render('admin/newslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Recenzje',
							page: 1,
							reviewslist: reviewslist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas edytowania newsa!"
						});
					});
				}
			});
		}
	} else {
		noPerm(req, res, next);
	}
});

// REVIEWS SYSTEM BY HENIOOO//

// EDIT CONFIG BY HENIOOO //

router.get('/admin/config', function(req, res, next) {
	db.getConfig().then(config => {
	console.log(config.data.value);
			res.render('admin/config', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Konfiguracja',
				config: config.data.value,
				db: db, 
				session: req.session
			});
		});

});

// EDIT CONFIG BY HENIOOO //

function noPerm(req, res, next) {
	res.render('admin/noperm', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		themes: theme.themes,
		title: 'Brak uprawnień!',
		db: db, 
		session: req.session
	});
}

module.exports = router;