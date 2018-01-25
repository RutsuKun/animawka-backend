const express = require('express');
var router = express.Router();

var theme = {
	id: "purple",
	color: "#5B3A2E",
	primary: "deep-purple",
	accent: "purple",
	logo: "asuna",
	light: false,
	modifiers: {
		bg: "lighten-4",
		nav: "accent-1",
		infocards: "deep-purple lighten-3 white-text"
	}
};

router.get('/', function(req, res, next) {
  res.render('index', { theme: theme, session: req.session, title: 'Strona główna' });
});

module.exports = router;