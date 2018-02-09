const express = require('express'),
	db = require('./database'),
	theme = require('./theme'),
	server = require('./server'),
	config = require('./config');
var router = express.Router();

router.get('/', function(req, res, next) {
	db.getLastEpisodes().then(eps => {
		//console.log(eps);
		if (eps === undefined) eps = [];
		res.render('index', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Strona główna',
			db: db, 
			session: req.session, 
			anime: eps
		});
	});
});

router.get('/anime/:name/:episode', function(req, res, next) {
	db.getAnimeEpisode(req.params.name, req.params.episode).then(anime => {
		res.render('animewatch', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: anime.title,
			data: anime.data,
			episode: anime.episode,
			players: anime.players,
			error: anime.error,
			db: db, 
			session: req.session
		});
	});
});

router.get('/anime/:name', function(req, res, next) {
	if (db.isInt(req.params.name)) {
		db.getAnimeList(req.params.name).then(animelist => {
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
			res.render('animeinfo', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: anime.title,
				data: anime.data,
				episodes: anime.episodes,
				error: anime.error,
				db: db, 
				session: req.session
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
		title: 'Strona główna',
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