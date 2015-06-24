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
          },
          formatter: function(options) {
              // Return string will be passed to logger.
              console.log("options", options);
              return options.timestamp().toString() +' '+ options.level.toUpperCase() +' '+ (undefined !== options.message ? options.message : '') +
                  (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
          }
      })
    ]
  });
}

module.exports = getLogger;