(function() {
  'use strict';
  /**
   * Module dependencies
   */

  var express = require('express'),
    http = require('http'),
    path = require('path'),
    api = require('./routes/api'),
    mongoose = require('mongoose'),
    config = require('./config');

  var app = module.exports = express();

  var connect = function() {
    var options = {
      server: {
        socketOptions: {
          keepAlive: 1
        }
      }
    };
    mongoose.connect(config.dbAdress, options);
  };
  connect();

  // Error handler
  mongoose.connection.on('error', function(err) {
    console.error(err);
  });

  // Reconnect when closed
  mongoose.connection.on('disconnected', function() {
    connect();
  });


  /**
   * Configuration
   */

  app.get('/api/offers', api.offers.get);
  app.get('/api/tags', api.tags.get);

  app.set('port', config.port);
  app.use(express.static(path.join(__dirname, '..', 'public')));

  /**
   * Start Server
   */

  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });

})();
