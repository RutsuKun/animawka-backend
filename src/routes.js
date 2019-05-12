const express = require('express'),
	db = require('./database'),
	theme = require('./theme'),
	server = require('./server'),
	config = require('./config'),
 BBCodeParser = require('bbcode-parser'),
 parser = new BBCodeParser(BBCodeParser.defaultTags()),
 BBTag = require('bbcode-parser/bbTag');

var noperm = require('./routes/admin/noperm')
var bbTags = {};
var router = express.Router();

require('./routes/home')(router, theme, db);
require('./routes/anime')(router, theme, db);
require('./routes/login')(router, theme, db, server, config);
require('./routes/register')(router, theme, db, server,  config);
require('./routes/logout')(router, theme, db);
require('./routes/contact')(router, theme, db);
require('./routes/rules')(router, theme, db);
require('./routes/search')(router, theme, db);
require('./routes/news')(router, theme, db);

// ADMIN //
require('./routes/admin/admin')(router, theme, db, noperm);
require('./routes/admin/accounts')(router, theme, db, noperm);
require('./routes/admin/anime')(router, theme, db, noperm);
require('./routes/admin/group')(router, theme, db, noperm);
require('./routes/admin/news')(router, theme, db, noperm);
require('./routes/admin/reviews')(router, theme, db, noperm);
require('./routes/admin/settings')(router, theme, db, noperm);
// ADMIN //

// PANEL //

require('./routes/panel/panel')(router, theme, db, noperm);

// PANEL //

module.exports = router;