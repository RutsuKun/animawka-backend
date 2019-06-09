module.exports = function(app, theme, db){

app.get('/konto', (req, res, next) => {
	db.getUser(req.session.uid).then(user => {
		res.render('account', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Konto',
			user:user.data,
			db: db, 
			session: req.session
		});	
	});
});

}