var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    googleapis = require('googleapis'),
    OAuth2Client = googleapis.OAuth2Client;

var config = require('./config.json') || {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REDIRECT_URL: process.env.REDIRECT_URL
};

var oauth2Client = new OAuth2Client(config.CLIENT_ID , config.CLIENT_SECRET, config.REDIRECT_URL);
var mirrorClient;

var app = express();

app.set('port', process.env.PORT || 5000);
//app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.bodyParser());
//app.use(express.methodOverride());
app.use("/", express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
  if(oauth2Client.credentials) {
    res.sendfile('index.html');
  } else {
    var url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/glass.timeline'
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
      console.log('tokens',tokens);
      oauth2Client.credentials = tokens;

      googleapis.discover('mirror', 'v1')
        .execute(function(err, client) {
          if(!err) {
            mirrorClient = client;
            res.redirect('/')
          } else {
            failure(err);
            res.send(500, err);
          }
        })
    }
  });
});

// Get timeline items
app.get('/timeline', function (req, res) {
  mirrorClient.mirror.timeline.list()
    .withAuthClient(oauth2Client)
    .execute(function (err, data) {
      if (!!err)
        res.send(500, err);
      else
        res.send(data);
    });
});

// Insert text into timeline
app.post('/timeline/insert/text', function(req, res) {
  mirrorClient.mirror.timeline.insert({
      "text": req.body.message,
      "speakableText": req.body.message,
      "notification" : {
        level: 'DEFAULT'
      },
      "menuItems": [{"action": "DELETE"}]
    })
    .withAuthClient(oauth2Client)
    .execute(function(err, data){
      if (!!err)
        failure(err);
      else
        success(data);
    });
  res.send('ok');
});

app.post('/timeline/insert/html', function(req, res) {
  mirrorClient.mirror.timeline.insert({
    "html": '<article class="photo" style="left: 0px; visibility: visible;"> <img src="https://mirror-api-playground.appspot.com/links/filoli-spring-fling.jpg" width="100%" height="100%"> <div class="photo-overlay"></div> <section> <p class="text-auto-size">' + req.body.message + '</p> </section> </article>',
    "notification" : {
      level: 'DEFAULT'
    },
    "menuItems": [{"action": "DELETE"}]
  })
    .withAuthClient(oauth2Client)
    .execute(function(err, data){
      if (!!err)
        failure(err);
      else
        success(data);
    });

  res.send('ok');
});


var success = function(data) { console.log('success',data); };
var failure = function(data) { console.log('failure',data); };

// Start server
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});