module.exports = function(app, theme, db, noperm){

app.get('/admin', (req, res, next) => {
	if (req.session && req.session.admin) {
		res.render('admin/home', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Panel administracyjny',
			db: db, 
			session: req.session
		});
	} else {
		noperm(theme, db, req, res, next);
	}
});

}