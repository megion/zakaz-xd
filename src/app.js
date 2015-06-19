var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');

var config = require('./config');
var mongodb = require('./lib/mongodb');
var log = require('./lib/log')(module);
var HttpError = require('./error').HttpError;


mongodb.openConnection(function(err, db) {
	if (err) {
		log.error(err);
		return;
	}

    var webApp = express();
	http.createServer(webApp).listen(config.port, config.ipaddress, function() {
        console.log('%s: Node server started on %s:%d ...',
            Date(Date.now() ), config.ipaddress, config.port);
	});
	initWebApp(webApp);
});

function initWebApp(app) {
	var cookieParser = require('cookie-parser');
	var bodyParser = require('body-parser');
	var errorhandler = require('errorhandler');
	var session = require('express-session');

	if (app.get('env') == 'development') {
		app.use(errorhandler());
	}

	app.use(favicon());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded());
	app.use(cookieParser());

    //var MongoStore = require('connect-mongo')(session);
	app.use(session({
		secret : config.session.secret, // ABCDE242342342314123421.SHA256
		saveUninitialized: true,
	    resave: true,
		key : config.session.key,
		cookie : config.session.cookie
		//store : new MongoStore({
		//	db : config.mongodb.db,
		//	host : config.mongodb.server.host,
		//	port : config.mongodb.server.port
		//})
	}));

    app.use(express.static(path.join(__dirname, 'public')));
	app.use(require('./middleware/sendHttpError'));

    // routes
    var auth = require('./routes/auth');
    app.use('/auth', auth);

	app.use(function(err, req, res, next) {
		if (typeof err == 'number') { // next(404);
			err = new HttpError(err);
		}

		if (err instanceof HttpError) {
			log.error(err); //
			res.sendHttpError(err);
		} else {
			if (app.get('env') == 'development') {
				var handler = errorhandler();
				handler(err, req, res, next);
			} else {
				log.error(err);
				err = new HttpError(500);
				res.sendHttpError(err);
			}
		}
	});
}



