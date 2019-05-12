module.exports = function(app, theme, db, server, config){

app.get('/zaloguj', function(req, res, next) {	
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

app.post('/zaloguj', async function(req, res, next) {
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
		req.session.group = ss.group;
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

}