module.exports = function(app, theme, db){

app.get('/szukaj', (req, res, next) => {
		res.render('search', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Wyszukiwarka',
			db: db,
			search:"",
			session: req.session
		});
});

app.get('/szukaj/:q', (req, res, next) => {
		res.render('search', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Wyszukiwarka',
			db: db,
			search:req.params.q,
			session: req.session
		});
});

}