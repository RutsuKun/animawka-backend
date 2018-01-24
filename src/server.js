const express = require('express'),
	ejs = require('ejs'),
	LRU = require('lru-cache'),
	fs = require("fs"),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser');

ejs.cache = LRU(100);

var routes = {};
var exports = module.exports = {};

exports.start = cfg => {
	exports.app = express();
	registerRoutes(cfg, exports.app);
	exports.app.listen(cfg.port, () => {
		console.log("Serwer WWW otwarty na porcie :" + cfg.port);
	});
}

function registerRoutes(cfg, app) {
	var normalizedPath = path.join(__dirname, "routes");
	fs.readdirSync(normalizedPath).forEach(file => {
		routes[file] = require("./routes/" + file);
	});
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(cookieParser());
	if (cfg.favicon)
		app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.use(express.static(path.join(__dirname, '../public')));

	app.use('/', routes["index.js"]);
}