var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    googleapis = require('googleapis'),
    OAuth2Client = googleapis.OAuth2Client;


var config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REDIRECT_URL: process.env.REDIRECT_URL
};

var oauth2Client = new OAuth2Client(config.CLIENT_ID , config.CLIENT_SECRET, config.REDIRECT_URL);

var app = express();
app.set('port', process.env.PORT || 5000);

// Middleware
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use("/", express.static(path.join(__dirname, 'public')));

// OAuth
app.get('/', function(req, res) {
  if(oauth2Client.credentials) {
    // Authenticated, carry on :)
    res.sendfile('index.html');
  } else {
    // Redirect to Google, authenticate
    var url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/glass.timeline https://www.googleapis.com/auth/glass.location'
    });
    res.redirect(url)
  }
});

app.get('/oauth2callback', function(req, res){
  // Trade auth code for access token
  oauth2Client.getToken(req.query.code, function(err, tokens){
    if (!!err){
      res.send(500, err);
    } else {
      // Success!
      oauth2Client.credentials = tokens;

      // Load all other routes
      fs.readdirSync(__dirname + '/routes').forEach(function(file) {
        require('./routes/' + file)(app, oauth2Client);
      });

      // Redirect back
      res.redirect('/');
    }
  });
});


// Start server
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});