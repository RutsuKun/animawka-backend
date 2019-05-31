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

}