const express = require('express'),
	ejs = require('ejs'),
	LRU = require('lru-cache'),
	fs = require("fs"),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	minify = require('express-minify'),
	compression = require('compression'),
	session = require('express-session');

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

function NotFound(msg) {
	this.name = 'NotFound';
	Error.call(this, msg);
	Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;

function registerRoutes(cfg, app) {
	var normalizedPath = path.join(__dirname, "routes");
	fs.readdirSync(normalizedPath).forEach(file => {
		if (cfg.debug) console.log("Load route: " + file);
		routes[file] = require("./routes/" + file);
	});
	
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(session({
		secret: cfg['session-secret']
	}));
	
	/*if (cfg.debug) {
		app.use(errorHandler({ dumpExceptions: true, showStack: true }));
	} else {
		app.use(errorHandler());
	}*/
	//app.use(methodOverride());

	if (cfg.favicon)
		app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

	app.engine('ejs', require('express-ejs-extend')); // add this line
	app.set('view engine', 'ejs');
	app.set('views', path.join(__dirname, 'views'));

	app.use(compression());
	app.use(minify({
		cache: cfg.debug ? false : path.join(__dirname, '../cache'),
		uglifyJsModule: null,
		errorHandler: null,
		jsMatch: /javascript/,
		cssMatch: /css/,
		jsonMatch: /json/,
		lessMatch: /less/,
	}));
	app.use(express.static(path.join(__dirname, '../public')));

	app.use('/', routes["index.js"]);

	app.get('/*', (req, res) => {
		throw new NotFound('Page not found.');
	});

	app.use((err, req, res, next) => {
		if (err instanceof NotFound) {
			res.render('404', { status: 404 });
		} else {
			res.render('error', { status: 500, message: "Error!", error: err });
			console.log(err);
		}
	});
}