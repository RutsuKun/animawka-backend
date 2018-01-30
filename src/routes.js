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

router.get('/lista', function(req, res, next) {
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

router.get('/lista/:page', function(req, res, next) {
	if (!db.isInt(req.params.page)) req.params.page = 1;

	db.getAnimeList(req.params.page).then(animelist => {
		res.render('animelist', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Lista anime',
			page: req.params.page,
			animelist: animelist,
			db: db, 
			session: req.session
		});
	});
});

router.get('/konto/wyloguj', function(req, res, next) {
	req.session.destroy();

	res.render('logout', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		themes: theme.themes,
		title: 'Strona główna',
		db: db, 
		session: req.session
	});
});

router.post('/konto/zaloguj', async function(req, res, next) {
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

router.get('/konto/zaloguj', function(req, res, next) {	
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

module.exports = router;