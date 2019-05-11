module.exports = function(app, theme, db, noperm){

app.get('/admin/news', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/newnews', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});


app.post('/admin/newnews', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/editnews/:id', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.post('/admin/editnews/:id', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

}