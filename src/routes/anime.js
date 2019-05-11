module.exports = function(app, theme, db){

app.get('/anime', function(req, res, next) {
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

app.get('/anime/:name', function(req, res, next) {
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
		  db.getUserLogin(anime.data.user).then(async user => {
      res.render('animeinfo', {
        theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
        themes: theme.themes,
        title: anime.title,
        data: anime.data,
        user:user,
        episodes: anime.episodes,
        error: anime.error,
        db: db, 
        session: req.session
			});
		});
		});
	}
});

app.get('/anime/:name/:episode', function(req, res, next) {
	db.getAnimeEpisode(req.params.name, req.params.episode).then(anime => {
			db.getUserLogin(anime.data.user).then(user => {
		console.log(anime.title);
		res.render('animewatch', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: anime.title,
			data: anime.data,
			episode: anime.episode,
			players: anime.players,
			user:user,
			error: anime.error,
			db: db, 
			session: req.session
		});
		});
	});
});

}