var glassy = require('../glassy');
var flickr = require('../flickr-rnd');

module.exports = function (app, oauth2Client) {

  app.get('/location', function(req, res){
    glassy.getLatestLocation(oauth2Client)
      .then(function(location) {
        res.json(location);
      })
      .fail(function(err) {
        res.send(500, err);
      })
  });

  app.post('/flickr', function(req, res) {
    glassy.getLatestLocation(oauth2Client)
      .then(function(location) {
        flickr.randomFromLatLng(location.lat, location.lng)
          .then(function(image) {
            res.send(image);

            var html='<article class="photo">' +
              '<img src="' + image.url + '" width="100%" height="100%">' +
              '<div class="photo-overlay"/>' +
              '<section>' +
              '<p class="text-auto-size">'+ image.description + '</p>' +
              '</section>' +
              '</article>';

            glassy.insertHtmlTimelineItem(oauth2Client, html)
              .then(function() {
                res.send(image);
              })
          })
      })
      .fail(function(err) {
        res.send(500, err);
      })
  });
};