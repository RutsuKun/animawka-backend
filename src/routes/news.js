module.exports = function(app, theme, db){

app.get('/news/:id', (req, res, next) => {
		db.getNews(req.params.id).then(news => {
			db.getUser(news.data.user).then(async user => {

				res.render('viewnews', {
					theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
					themes: theme.themes,
					title: news.data.title,
					page: req.params.page,
					news: news,
					user: user,
					db: db, 
					session: req.session
				});
			});
		});
});

}