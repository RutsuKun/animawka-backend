const express = require('express'),
	db = require('./database'),
	theme = require('./theme'),
	server = require('./server'),
	config = require('./config'),
 BBCodeParser = require('bbcode-parser'),
 Discord = require('discord.js'), parser = new BBCodeParser(BBCodeParser.defaultTags()), BBTag = require('bbcode-parser/bbTag'), nodemailer = require('nodemailer');
var client = new Discord.Client();
var noperm = require('./routes/admin/noperm')
var bbTags = {};
var router = express.Router();

client.on('ready', () => {
console.log("Animawka Discord Bot is ready!");
client.user.setStatus('Online');
client.user.setGame('Animawka Backend', 'https://twitch.tv/Animawka');
});
client.login(config.cfg.discord.token);
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'henicz19@gmail.com',
	  pass: 'tecyghzxtxhobmgc'
	}
  });


require('./routes/home')(router, theme, db);
require('./routes/anime')(router, theme, db);
require('./routes/login')(router, theme, db, server, config);
require('./routes/register')(router, theme, db, server,  config);
require('./routes/logout')(router, theme, db);
require('./routes/account')(router, theme, db, transporter);
require('./routes/contact')(router, theme, db);
require('./routes/rules')(router, theme, db);
require('./routes/search')(router, theme, db);
require('./routes/news')(router, theme, db);


require('./routes/chat')(router, theme, db, server);
// GROUPS //

require('./routes/groups/groups')(router, theme, db);

// GROUPS //



// PANEL //

require('./routes/panel/panel')(router, theme, db, noperm);

// PANEL //

// ADMIN //
require('./routes/admin/admin')(router, theme, db, noperm);
require('./routes/admin/accounts')(router, theme, db, noperm);
require('./routes/admin/anime')(router, theme, db, noperm, client);
require('./routes/admin/group')(router, theme, db, noperm);
require('./routes/admin/news')(router, theme, db, noperm);
require('./routes/admin/reviews')(router, theme, db, noperm);
require('./routes/admin/settings')(router, theme, db, noperm, client);
// ADMIN //


module.exports = router;