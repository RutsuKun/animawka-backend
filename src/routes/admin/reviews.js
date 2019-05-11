module.exports = function(app, theme, db, noperm){

app.get('/admin/reviews', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getReviewsList(1).then(reviewslist => {
			res.render('admin/reviewslist', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Recenzje',
				page: 1,
				reviewslist: reviewslist,
				db: db,
				session: req.session,
				message: undefined
			});
		});
	} else {
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/newreview', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getUser(req.session.uid).then(async user => {
			res.render('admin/newreview', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Nowa recenzja',
				page: req.params.page,
				user: user,
				db: db, 
				session: req.session
			});
		});
	} else {
		noperm(theme, db, req, res, next);
	}
});

app.post('/admin/newreview', (req, res, next) => {
	if (req.session && req.session.admin) {
		console.log(req.body);
		db.newReview(req.body).then(data => {
			if (data.success) {
				db.getReviewsList(1).then(reviewslist => {
					res.render('admin/reviewslist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Recenzje',
						page: 1,
						reviewslist: reviewslist,
						db: db,
						session: req.session,
						message: "Dodano recenzje!"
					});
				});
			} else {
				db.getReviewsList(1).then(reviewslist => {
					res.render('admin/reviewslist', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Recenzje',
						page: 1,
						reviewslist: reviewslist,
						db: db,
						session: req.session,
						message: "Wystąpił błąd podczas dodawania recenzji!"
					});
				});
			}
		});
	} else {
		noperm(theme, db, req, res, next);
	}
});

app.get('/admin/editreview/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		db.getReview(req.params.id).then(review => {
			db.getUser(review.data.user).then(async user => {

				res.render('admin/editreview', {
					theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
					themes: theme.themes,
					title: 'Edycja recenzji',
					page: req.params.page,
					review: review,
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

app.post('/admin/editreview/:id', (req, res, next) => {
	if (req.session && req.session.admin) {
		console.log(req.body);
		if (req.body.action === "delete") {
			db.delReview(req.params.id).then(data => {
				if (data.success) {
					db.getReviewsList(1).then(reviewslist => {
						res.render('admin/reviewslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Recenzje',
							page: 1,
							reviewslist: reviewslist,
							db: db,
							session: req.session,
							message: "Recenzja została usunięta!"
						});
					});
				} else {
					db.getReviewsList(1).then(reviewslist => {
						res.render('admin/reviewslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Recenzje',
							page: 1,
							reviewslist: reviewslist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas usuwania recenzji!"
						});
					});
				}
			});
		} else if (req.body.action == "edit") {
			db.editReview(req.body).then(data => {
				if (data.success) {
					db.getReviewsList(1).then(reviewslist => {
						res.render('admin/reviewslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Recenzje',
							page: 1,
							reviewslist: reviewslist,
							db: db,
							session: req.session,
							message: "Zmiany zostały zapisane!"
						});
					});
				} else {
					db.getReviewsList(1).then(reviewslist => {
						res.render('admin/newslist', {
							theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
							themes: theme.themes,
							title: 'Recenzje',
							page: 1,
							reviewslist: reviewslist,
							db: db,
							session: req.session,
							message: "Wystąpił błąd podczas edytowania newsa!"
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