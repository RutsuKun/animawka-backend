const express = require('express'),
	db = require('./database'),
	theme = require('./theme');
var router = express.Router();

router.get('/', function(req, res, next) {
	db.getLastEpisodes().then(eps => {
		console.log(eps);
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

router.post('/konto/zaloguj', async function(req, res, next) {
	console.log(req.body);
	var suc = false;
	try {
		if (req.body.login && req.body.login != '' && req.body.password && req.body.password != '')
			suc = await db.authenticate(req.body.login, req.body.password);
	} catch (e) {
		suc = false;
	}

	console.log("Login success: " + suc);

	res.render('login', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		title: 'Logowanie',
		themes: theme.themes,
		db: db,
		session: req.session,
		login: true,
		success: suc
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
		success: false
	});
});

module.exports = router;