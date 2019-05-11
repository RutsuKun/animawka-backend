module.exports = function(app, theme, db){

app.get('/wyloguj', function(req, res, next) {
	req.session.destroy();

	res.render('logout', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		themes: theme.themes,
		title: 'Wylogowano',
		db: db, 
		session: req.session
	});
});

}