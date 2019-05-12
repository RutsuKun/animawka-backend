module.exports = function(app, theme, db, noperm){

app.get('/panel', (req, res, next) => {
	if (req.session && req.session.group) {
		res.render('panel/home', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Panel uploadera',
			db: db, 
			session: req.session
		});
	} else {
		noperm(theme, db, req, res, next);
	}
});

app.get('/panel/group', (req, res, next) => {
	if (req.session && req.session.group) {
		db.getGroupAnimeList(req.session.group).then(anime => {
			console.log(anime);
			db.getGroup(req.session.group).then(group => {
				
				console.log("============================");
				console.log(group.data.members);
				console.log("============================");

				var members = JSON.parse(group.data.members).members;

				console.log(JSON.parse(group.data.members).members);

				var grouparray = [];


				for (var i = 0; i < members.length; i++) {
					var member_id = members[i].user;
					var group_member_id = members[i].id;
					var member_rank = members[i].rank;
					db.getUserGroup(member_id, group_member_id, member_rank).then(user => {
						var element = {};
						element.id = user.group_member_id;
						element.member_id = user.data.ID;
						element.member_avatar = user.data.avatar;
						element.member_rank = user.member_rank;
						element.member_login = user.login;
						grouparray.push(element);

						if(members.length == grouparray.length){
							console.log(grouparray);
							res.render('panel/group', {
								theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
								themes: theme.themes,
								title: 'Grupa Suberska',
								db: db, 
								session: req.session,
								group:group,
								members:members,
								grouparray:grouparray,
								anime:anime
							});

						}

					});
				}
			});
		});
	} else {
			res.render('panel/nogroup', {
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
				themes: theme.themes,
				title: 'Grupa Suberska',
				db: db, 
				session: req.session
			});
			
		}

});

}