module.exports = function(app, theme, db){

app.get('/kontakt', (req, res, next) => {
		res.render('contact', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Kontakt',
			db: db, 
			session: req.session
		});
});

}