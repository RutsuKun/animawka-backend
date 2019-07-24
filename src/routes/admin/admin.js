module.exports = function(app, theme, db, noperm, client){
const discordbot = require("../../discordbot");


app.get('/admin', (req, res, next) => {
	discordbot.sendMessageEmbed("ktos wszedl w admin panel", "xd opis", "https://animawka.pl/admin", "https://cdntravelplanet.pl/4242/ALMA/polska/bieszczady/lesko/manga-i-anime---lesko_2.jpg", client);
	if (req.session && req.session.admin) {
		res.render('admin/home', {
			theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Panel administracyjny',
			db: db, 
			session: req.session
		});
	} else {
		noperm(theme, db, req, res, next);
	}
});

}