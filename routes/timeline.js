var glassy = require('../glassy');
var util = require('util');

module.exports = function (app, oauth2Client) {

  app.get('/timeline', function (req, res) {
    glassy.getTimelineItems(oauth2Client)
      .then(function(items) {
        res.json(items)
      })
      .fail(function(err) {
        res.send(500, err);
      });
  });

  app.post('/timeline/insert/text', function(req, res) {
    glassy.insertTextTimelineItem(oauth2Client, req.body.message)
      .then(function() {
        res.send('ok');
      })
      .fail(function(err) {
        res.send(500, err);
      });
  });

  app.post('/timeline/insert/html', function(req, res) {
    var html = '<article>' +
      '<figure>' +
      '<img src="http://thatsglassy.herokuapp.com/img/person.jpg">' +
      '</figure>' +
      '<section>' +
      '<table class="text-small align-justify">' +
      '<tbody>' +
      '<tr>' +
      '<td>Born</td>' +
      '<td>Feb 12, 1975</td>' +
      '</tr>' +
      '<tr>' +
      '<td>Died</td>' +
      '<td>by Laser, Dec 4, 2013</td>' +
      '</tr>' +
      '<tr>' +
      '<td>Likes</td>' +
      '<td>Cool Tech, Unicorns</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>' +
      '</section>' +
      '</article>';


    glassy.insertHtmlTimelineItem(oauth2Client, html)
      .then(function() {
        res.send('ok');
      })
      .fail(function(err) {
        res.send(500, err);
      });
  });

  app.get('/timeline/get/:id', function(req, res) {
    glassy.getTimelineItem(oauth2Client, req.params.id)
      .then(function(item) {
        console.log(item);
        res.send(item)
      })
      .fail(function(err) {
        res.send(500, err);
      });
  });

  app.post('/timeline/reply', function(req, res) {
    console.log('Incoming!');
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