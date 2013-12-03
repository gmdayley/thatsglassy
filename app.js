var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    util = require('util'),
    googleapis = require('googleapis'),
    OAuth2Client = googleapis.OAuth2Client,
    glassy = require('./glassy');

var rndFlickr = require('./flickr-rnd');

var config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REDIRECT_URL: process.env.REDIRECT_URL
};

var oauth2Client = new OAuth2Client(config.CLIENT_ID , config.CLIENT_SECRET, config.REDIRECT_URL);

var app = express();
app.set('port', process.env.PORT || 5000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use("/", express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
  if(oauth2Client.credentials) {
    res.sendfile('index.html');
  } else {
    var url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/glass.timeline https://www.googleapis.com/auth/glass.location'
    });
    console.log(url);
    res.redirect(url)
  }
});

app.get('/oauth2callback', function(req, res){
  oauth2Client.getToken(req.query.code, function(err, tokens){
    if (!!err){
      failure(err);
      res.send(500, err);
    } else {
      oauth2Client.credentials = tokens;
      res.redirect('/');
    }
  });
});


app.get('/timeline', function (req, res) {
  glassy.getTimelineItems(oauth2Client)
    .then(function(items) {
      res.json(items)
    })
    .fail(function(err) {
      res.send(500, err);
    })
});

app.post('/timeline/insert/text', function(req, res) {
  glassy.insertTextTimelineItem(oauth2Client, req.body.message)
    .then(function() {
      res.send('ok');
    })
    .fail(function(err) {
      res.send(500, err);
    })
});

app.get('/location', function(req, res){
  glassy.getLatestLocation(oauth2Client)
    .then(function(location) {
      res.json(location);
    })
    .fail(function(err) {
      res.send(500, err);
    })
});

app.get('/flickr', function(req, res) {
  glassy.getLatestLocation(oauth2Client)
    .then(function(location) {
      rndFlickr.randomFromLatLng(location.lat, location.lng)
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

app.get('/tom', function(req, res) {
  var html = '<article>' +
    '<figure>' +
    '<img src="https://mirror-api-playground.appspot.com/links/lincoln.png">' +
    '</figure>' +
    '<section>' +
    '<table class="text-small align-justify">' +
      '<tbody>' +
        '<tr>' +
          '<td>Born</td>' +
          '<td>Feb 12, 1809</td>' +
        '</tr>' +
        '<tr>' +
          '<td>Died</td>' +
          '<td>Apr 15, 1865</td>' +
        '</tr>' +
        '<tr>' +
          '<td>Height</td>' +
          '<td>6\' 4"</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>' +
    '</section>' +
  '</article>';


  glassy.insertHtmlTimelineItem(oauth2Client, html)
    .then(function() {
      res.send('ok');
    })
});

app.get('/unsub', function(req, res) {
  glassy.unsubscribe(oauth2Client);

  res.send('ok');
});

app.get('/slist', function(req, res) {
  glassy.listSubscriptions(oauth2Client);

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

app.post('/subscriptions/timeline', function(req, res) {
  console.log('GOT AN UPDATE');
  console.log(util.inspect(req.body, { colors: true, depth: null }));
  res.send(200, 'ok');
});

// Start server
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});