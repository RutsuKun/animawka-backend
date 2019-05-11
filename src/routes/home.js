module.exports = function(app, theme, db){

app.get('/', function(req, res, next) {
	db.getLastEpisodes().then(eps => {
		db.getLastNews(1).then(newslist => {
    db.getUser(newslist.news[0].user).then(async user => {
				//console.log(user);
				if (eps === undefined) eps = [];
				res.render('index', {
					theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
					themes: theme.themes,
					title: 'Strona główna',
					db: db, 
					session: req.session, 
					anime: eps,
					news:newslist,
					user:user
				});
			});
		});
	});
});

}