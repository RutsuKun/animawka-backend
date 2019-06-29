module.exports = function(app, theme, db){

app.get('/', function(req, res, next) {
db.getConfig().then(data => {

console.log(data);

if(data.maintenance.value == 1){

console.log("przerwa techniczna");

res.render('maintenance', {
			title: 'Animawka soon',
			db: db,
			session: req.session,
  maintenance_text:data.maintenance_text.value, maintenance_time:data.maintenance_time.value
		});

} else {

	db.getLastEpisodes().then(eps => {
		db.getLastNews(1).then(newslist => {
				db.getLastAnime().then(animelast => {
					if (eps === undefined) eps = [];
					res.render('index', {
						theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
						themes: theme.themes,
						title: 'Strona główna',
						db: db, 
						session: req.session, 
						anime: eps,
						news:newslist,
						animelast:animelast
					});
				});
		});
	});

}

});





});

}