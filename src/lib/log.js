var winston = require('winston');
var ENV = process.env.NODE_ENV;

// can be much more flexible than that O_o
function getLogger(module) {

  var path = module.filename.split('/').slice(-2).join('/');

  return new winston.Logger({
    transports: [
      new winston.transports.Console({
          colorize: true,
          handleExceptions: true,
          //json: true,
          level: (ENV == 'development') ? 'debug' : 'info',
          label: path,
          timestamp: function() {
              return Date(Date.now());
          }
      })
    ]
  });
}

module.exports = getLogger;