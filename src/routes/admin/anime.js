module.exports = function(app, theme, db, noperm){

app.get('/admin/anime', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/anime/:page', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/newanime', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.post('/admin/newanime', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/editanime/:id', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.post('/admin/editanime/:id', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/listepisodes/:id', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/newepisode/:id', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.post('/admin/newepisode/:id', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/editepisode/:id/:num', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});



app.post('/admin/editepisode/:id/:num', (req, res, next) => {
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
		noperm(theme, db, req, res, next);
	}
});

}