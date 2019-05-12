module.exports = function(app, theme, db, noperm){

app.get('/admin/groups', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getGroupList(1).then(grouplist => {
			res.render('admin/grouplist', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Grupy',
				page: 1,
				grouplist: grouplist,
				db: db,
				session: req.session,
				message: undefined
			});
		});
	} else {
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/newgroup', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getUser(req.session.uid).then(async user => {
			res.render('admin/newgroup', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Nowa grupa',
				page: req.params.page,
				user: user,
				db: db, 
				session: req.session,
			});
		});
	} else {
		noperm(theme, db, req, res, next);
	}
});

app.post('/admin/newgroup', (req, res, next) => {
	if (req.session && req.session.admin) {
		console.log(req.body);
		db.newGroup(req.body).then(data => {
			if (data.success) {
				db.getGroupList(1).then(grouplist => {
					res.render('admin/grouplist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Grupy',
						page: 1,
						grouplist: grouplist,
						db: db,
						session: req.session,
						message: "Zmiany zostały zapisane!"
					});
				});
			} else {
				db.getGroupList(1).then(grouplist => {
					res.render('admin/animelist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Grupy',
						page: 1,
						grouplist: grouplist,
						db: db,
						session: req.session,
						message: "Wystąpił błąd podczas dodawania anime!"
					});
				});
			}
		});
	} else {
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/editgroup/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getGroupByName(req.params.id).then(group => {
			db.getUser(group.data.created_user).then(async user => {
				res.render('admin/editgroup', {
					theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
					themes: theme.themes,
					title: 'Edycja grupy',
					group: group,
					user: user,
					db: db, 
					session: req.session
				});
			});
		});
	} else {
		noperm(theme, db, req, res, next);
	}
});

app.post('/admin/editgroup/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		console.log(req.body);
		if (req.body.action === "delete") {
			db.delGroup(req.params.id).then(data => {
				if (data.success) {
					db.getGroupList(1).then(grouplist => {
						res.render('admin/grouplist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Grupy',
							page: 1,
							grouplist: grouplist,
							db: db,
							session: req.session,
							message: "Grupa usunięta!"
						});
					});
				} else {
					db.getGroupList(1).then(grouplist => {
						res.render('admin/newslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Grupy',
							page: 1,
							grouplist: grouplist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas usuwania grupy!"
						});
					});
				}
			});
		} else if (req.body.action == "edit") {
			db.editGroup(req.body).then(data => {
				if (data.success) {
					db.getGroupList(1).then(grouplist => {
						res.render('admin/grouplist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Grupy',
							page: 1,
							grouplist: grouplist,
							db: db,
							session: req.session,
							message: "Zmiany zostały zapisane!"
						});
					});
				} else {
					db.getGroupList(1).then(grouplist => {
						res.render('admin/grouplist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Grupy',
							page: 1,
							grouplist: grouplist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas edytowania grupy!"
						});
					});
				}
			});
		}
	} else {
		noperm(theme, db, req, res, next);
	}
});

}