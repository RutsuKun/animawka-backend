module.exports = function(app, theme, db, noperm){

app.get('/admin/accounts', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/accounts/:page', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/editaccount/:id', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.post('/admin/editaccount/:id', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

}