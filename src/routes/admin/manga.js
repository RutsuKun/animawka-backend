module.exports = function(app, theme, db, noperm, client){
    const discordbot = require("../../discordbot");
    app.get('/admin/manga', (req, res, next) => {
        if (req.session && req.session.admin) {
            db.getMangaList(1).then(mangalist => {
                res.render('admin/mangalist', {
                    theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
                    themes: theme.themes,
                    title: 'Manga',
                    page: 1,
                    mangalist: mangalist,
                    db: db,
                    session: req.session,
                    message: undefined
                });
            });
        } else {
            noperm(theme, db, req, res, next);
        }
    });
    
    app.get('/admin/newmanga', (req, res, next) => {
        if (req.session && req.session.admin) {
            db.getUser(req.session.uid).then(async user => {
                res.render('admin/newmanga', {
                    theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
                    themes: theme.themes,
                    title: 'Nowa manga',
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

    app.post('/admin/newmanga', (req, res, next) => {
        if (req.session && req.session.admin) {
            console.log(req.body);
            db.newManga(req.body).then(data => {
                console.log(req.body);
                if (data.success) {
                    discordbot.sendMessageEmbed("595985346941157389", req.body.name, req.body.description, "https://animawka.pl/manga", req.body.image, client);
                    res.redirect("/admin/manga?success");
                } else {
                    res.redirect("/admin/manga?error");
                }
            });
        } else {
            noperm(theme, db, req, res, next);
        }
    });
    }