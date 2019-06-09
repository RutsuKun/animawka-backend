module.exports = function(app, theme, db){

app.get('/groups', (req, res, next) => {
db.getGroupList(1).then(grouplist => {

		res.render('groups/groups', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Grupy Suberskie',
			db: db, 
			session: req.session,
   grouplist:grouplist
		});

});

});

app.get('/groups/register', (req, res, next) => {
if (req.session && req.session.authorized) {

db.getUser(req.session.uid).then(user => {

		res.render('groups/register', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Zarejestruj Grupe',
			db: db, 
			session: req.session,
   user:user
		});

});

} else {
		res.render('groups/nologged', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Nie zalogowany',
			db: db, 
			session: req.session
		});
}

});

}