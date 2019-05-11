module.exports = function(app, theme, db, noperm){

app.get('/admin/config', function(req, res, next) {
	db.getConfig().then(config => {
	console.log(config.data.value);
			res.render('admin/config', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Konfiguracja',
				config: config.data.value,
				db: db, 
				session: req.session
			});
		});

});

}