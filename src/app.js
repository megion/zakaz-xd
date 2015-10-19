var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var domain = require('domain');

var config = require('./config');
var mongodb = require('./lib/mongodb');
var log = require('./lib/log')(module);
var HttpError = require('./error').HttpError;
var UnknownError = require('./error').UnknownError;
var AuthError = require('./error').AuthError;

var serverDomain = domain.create();

var server;

serverDomain.on('error', function(err) {
    log.error(err.stack);

    // программная ошибка поэтому для безопастности остановим сервер
    if (server) {
        server.close();
    }
    setTimeout(function(){
        process.exit(1);
    }, 1000).unref();
});

serverDomain.run(function() {
    mongodb.openConnection(function(err, db) {
        if (err) {
            log.error(err);
            return;
        }

        var webApp = express();
        server = http.createServer(webApp).listen(config.port, config.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now() ), config.ipaddress, config.port);
        });
        initWebApp(webApp);
    });
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

    app.use(express.static(path.join(__dirname, 'web', 'build')));

    // routes
    app.use('/auth', require('./routes/auth'));
    app.use('/users', require('./routes/users'));
    app.use('/roles', require('./routes/roles'));
    app.use('/orders', require('./routes/orders'));
    app.use('/products', require('./routes/products'));
    app.use('/user-products', require('./routes/user-products'));
    app.use('/user-product-prices', require('./routes/user-product-prices'));

	app.use(function(err, req, res, next) {
		if (typeof err == 'number') { // next(404);
			err = new HttpError(err);
		}

		if (err instanceof HttpError) {
            log.error(err.message);
            //log.error(err.stack);

            res.status(err.status);
            res.json({message: err.message, status: err.status, stack: err.stack});
		} else {
            log.error(err.stack);

            res.status(500);
            res.json({message: err.message, status: err.status, stack: err.stack});
		}
	});
}



