module.exports = function(app, theme, db){

app.get('/support', function(req, res, next) {
  res.render('404', {});
});

app.get('/support/:name', function(req, res, next) {
  db.getGropuByName(req.params.name).then(support => {
    res.render('support', {
      theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
      themes: theme.themes,
      paypal: support.paypal
		});
  });
});

}
