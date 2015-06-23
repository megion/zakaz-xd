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
	var session = require('express-session');

	app.use(favicon());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded());
	app.use(cookieParser());

	app.use(session({
		secret : config.session.secret, // ABCDE242342342314123421.SHA256
		saveUninitialized: true,
	    resave: true,
		key : config.session.key,
		cookie : config.session.cookie
	}));

    app.use(express.static(path.join(__dirname, 'public')));
	app.use(require('./middleware/sendHttpError'));

    // routes
    var auth = require('./routes/auth');
    app.use('/auth', auth);
    var users = require('./routes/users');
    app.use('/users', users);

	app.use(function(err, req, res, next) {
		if (typeof err == 'number') { // next(404);
			err = new HttpError(err);
		}

        log.error(err);
		if (err instanceof HttpError) {
			res.sendHttpError(err);
		} else {
            err = new HttpError(500);
            res.sendHttpError(err);
		}
	});
}



