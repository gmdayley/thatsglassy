var glassy = require('../glassy');

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
    glassy.listSubscriptions(oauth2Client);
    res.send('ok');
  });

  app.post('/subscribe/timeline', function(req, res) {
    console.log(util.inspect(req.body, { colors: true, depth: null }));

    //TODO - check userActions for type
    glassy.getTimelineItem(oauth2Client, req.body.itemId)
      .then(function(item) {
        console.log(item);
      })
      .fail(function(err) {
        console.log(err);
      });

    res.send(200, 'ok');
  });
};