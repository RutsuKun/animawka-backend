module.exports = function(app, theme, db, server, config){

app.get('/zarejestruj', function(req, res, next) {	
	res.render('register', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		title: 'Rejestracja',
		themes: theme.themes,
		db: db,
		session: req.session,
		register: false,
		success: false,
		captcha: false,
		enableCaptcha: config.cfg.recaptcha.enable
	});
});

app.post('/zarejestruj', async function(req, res, next) {
	var captcha = false;
	var ss = {success: false};
	console.log(req.body);

	if (server.recaptcha != null) {
		try {
			await server.recaptcha.validateRequest(req);

			try {
				if(req.body.password[0] === req.body.password[1]){
					if (req.body.login && req.body.login != '' && req.body.email && req.body.email != '' && req.body.password[0] && req.body.password[0] != '' && req.body.password[1] && req.body.password[1] != ''){
						ss = await db.register(req.body.login, req.body.email, req.body.password[0], req.body.password[1]);
					}
				} else {
					ss.success = false;
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
			if(req.body.password[0] === req.body.password[1]){
				if (req.body.login && req.body.login != '' && req.body.password[0] && req.body.password[0] != '' && req.body.password[1] && req.body.password[1] != ''){
					ss = await db.register(req.body.login, req.body.password[0], req.body.password[1]);
				}
			} else {
				ss.success = false;
			}
		} catch (e) {
			console.log(e);
			ss.success = false;
		}
	}

	res.render('register', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		title: 'Rejestracja',
		themes: theme.themes,
		db: db,
		session: req.session,
		register: true,
		success: ss.success,
		captcha: captcha,
		enableCaptcha: config.cfg.recaptcha.enable
	});
});

}