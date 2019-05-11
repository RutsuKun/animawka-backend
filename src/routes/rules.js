module.exports = function(app, theme, db){

app.get('/regulamin', (req, res, next) => {
		res.render('rules', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Regulamin',
			db: db, 
			session: req.session
		});
});

}