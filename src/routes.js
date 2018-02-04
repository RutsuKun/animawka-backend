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

//////////////////////////////////////////////////////////////////////////////////

router.get('/admin', function(req, res, next) {
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

router.get('/admin/accounts', function(req, res, next) {
	if (req.session && req.session.admin) {
		db.getUserList(1).then(userlist => {
			res.render('admin/accounts', {
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

router.get('/admin/accounts/:page', function(req, res, next) {
	if (req.session && req.session.admin) {
		db.getUserList(req.params.page).then(userlist => {
			res.render('admin/accounts', {
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

router.get('/admin/editaccount/:id', function(req, res, next) {
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

router.post('/admin/editaccount/:id', function(req, res, next) {
	if (req.session && req.session.admin) {
		if (req.body.action === "delete") {
			if (req.session.uid == req.params.id) {
				db.getUserList(1).then(userlist => {
					res.render('admin/accounts', {
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
						res.render('admin/accounts', {
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