var glassy = require('../glassy');
var util = require('util');

module.exports = function (app, oauth2Client) {

  app.get('/unsubscribe/timeline', function(req, res) {
    glassy.unsubscribe(oauth2Client);
    res.send('ok');
  });

  app.get('/subscribe/timeline', function(req, res) {
    glassy.subscribe(oauth2Client)
      .then(function() {
        res.send('ok');
      })
      .fail(function(err) {
        res.send(500, err);
      })
  });

  app.get('/subscribe/list', function(req, res) {
    glassy.listSubscriptions(oauth2Client)
      .then(function(data) {
        res.json(data);
      })
      .fail(function(err) {
        res.send(500, err);
      })
  });
};