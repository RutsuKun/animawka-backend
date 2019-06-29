module.exports = function(app, theme, db, noperm){

app.get('/admin/settings', function(req, res, next) {
	db.getConfig().then(config => {
	console.log(config.data.value);
			res.render('admin/settings', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Konfiguracja',
				config: config.data.value,
maintenance:config.maintenance.value,
    maintenance_text:config.maintenance_text.value,
    maintenance_time:config.maintenance_time.value,
				db: db, 
				session: req.session
			});

		});

});


app.post('/admin/settings/maintenance', (req, res, next) => {
	if (req.session && req.session.admin) {
		console.log(req.body.maintenance_time);

			db.editSettingsMaintenance(req.body).then(data => {
				if (data.success) {
res.redirect('/admin/settings?success=maintenance');
				} else {
res.redirect('/admin/settings?error=maintenance');
				}
			});

	} else {
		noperm(theme, db, req, res, next);
	}
});

}
