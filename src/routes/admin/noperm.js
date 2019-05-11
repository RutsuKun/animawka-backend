module.exports = function(theme, db, req, res, next){

res.render('admin/noperm', {
		theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
		themes: theme.themes,
		title: 'Brak uprawnień!',
		db: db, 
		session: req.session
	});

}