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

router.post('/konto/zaloguj', function(req, res, next) {
	console.log(res.body);

	res.render('login', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		title: 'Logowanie',
		themes: theme.themes,
		db: db,
		session: req.session,
		login: true,
		success: true
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