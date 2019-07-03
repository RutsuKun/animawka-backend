const express = require('express'),
	ejs = require('ejs'),
	LRU = require('lru-cache'),
	fs = require("fs"),
	path = require('path'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	minify = require('express-minify'),
	compression = require('compression'),
	session = require('express-session'),
	FileStore = require('session-file-store')(session),
	reCAPTCHA = require('recaptcha2'),
	Discord = require('discord.js'),
	markdown = require( "markdown" ).markdown,
	escape = require("html-escape"),
	http = require("http"), theme = require('./theme'), db = require('./database');

ejs.cache = LRU(100);

var routes = {};
var exports = module.exports = {};

exports.messages = [];

exports.start = cfg => {
	if (cfg.recaptcha.enable)
		exports.recaptcha=new reCAPTCHA({
			siteKey: cfg.recaptcha.site,
			secretKey: cfg.recaptcha.secret
		});
	else
		exports.recaptcha = null;

	exports.app = express();
	exports.server = http.createServer(exports.app);
	exports.io = require('socket.io')(exports.server);

	registerRoutes(cfg, exports.app);


	exports.server.listen(cfg.port, () => {
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
	/*fs.readdirSync(normalizedPath).forEach(file => {
		if (cfg.debug) console.log("Load route: " + file);
		routes[file] = require("./routes/" + file);
	});*/

	if (cfg.discord.enable) {
		app.use(function(req, res, next){
			res.io = exports.io;
			next();
		});
	}
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.set('trust proxy', 1)
	app.use(session({
		store: new FileStore({}),
		secret: cfg['session-secret']
	}));

	app.engine('ejs', require('express-ejs-extend')); // add this line
	app.set('view engine', 'ejs');
	app.set('views', path.join(__dirname, 'views'));

	app.use(compression());
	app.use(minify({
		cache: path.join(__dirname, '../cache'),
		uglifyJsModule: null,
		errorHandler: null,
		jsMatch: /javascript/,
		cssMatch: /css/,
		jsonMatch: /json/,
		lessMatch: /less/,
		dataMatch: /data/,
	}));
	app.use(express.static(path.join(__dirname, '../public')));
	app.use('/', require("./routes"));

	app.use((req, res, next) => {
		console.log("Not found");
		var err = new NotFound('Page not found.');
		err.status = 404;
		next(err);
	});

	/*app.use((err, req, res, next) => {
		if (err instanceof NotFound) {
			res.status(404).render('404', { status: 404 });
		} else {
			res.status(500).render('error', { status: 500, message: "Error!", error: err });
			console.log(err);
		}
	});*/
	app.use(function(err, req, res, next) {
		if (!res.headersSent) {
			if (err.status == 404) {
				res.status(404);
				res.render('404', {
				status: 404,
				theme: theme.getTheme(!req.cookies.theme ? 0 : req.cookies.theme),
			themes: theme.themes,
			title: 'Podana strona nie istnieje',
			db: db, 
			session: req.session});
			} else {
				//res.status(err.status || 500);
				res.render('error', {
					status: err.status || 500,
					message: err.message,
					error: {}
				});
			}
		}
	});
}

function processForHTML(text) {
	//text = escape(text);
	text = markdown.toHTML(text);
	text = emojis(text);
	text = Linkify(text);
	return text;
}

function emojis(text) {
	return text.replace(/(?:&lt;:)(.*)(?::)(.*)(?:&gt;)/, '<img class="emoji" src="//cdn.discordapp.com/emojis/$2.png"/>');
}

function Linkify(inputText) {
	var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	var replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
	var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
	return replacedText;
}
