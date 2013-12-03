var Q = require('q');
var googleapis = require('googleapis');
var mirrorClient;

function getMirrorClient() {
  var d = Q.defer();

  if(!mirrorClient) {
    googleapis.discover('mirror', 'v1')
      .execute(function(err, client) {
        if(!!err) {
          // failed
          console.log('Error: ', err);
          d.reject(err);
        } else {
          mirrorClient = client;
          d.resolve(mirrorClient);
        }
      });
  } else {
    d.resolve(mirrorClient);
  }

  return d.promise;
}

function getLatestLocation(authClient) {
  var d = Q.defer();

  getMirrorClient().then(function(client) {
    client.mirror.locations
      .list()
      .withAuthClient(authClient)
      .execute(function(err, data) {
        if(!!err) {
          d.reject(err)
        } else {
          d.resolve({
            lat: data.items[0].latitude,
            lng: data.items[0].longitude
          })
        }
      })
  });

  return d.promise;
}

function getTimelineItems(authClient) {
  var d = Q.defer();

  getMirrorClient().then(function(client) {
    client.mirror.timeline
      .list()
      .withAuthClient(authClient)
      .execute(function(err, data) {
        if(!!err) {
          d.reject(err);
        } else {
          d.resolve(data);
        }
      });
    });

  return d.promise;
}

function insertTextTimelineItem(authClient, text) {
  var d = Q.defer();

  getMirrorClient().then(function(client) {
    client.mirror.timeline
      .insert({
        "text": text,
        "notification" : {
          level: 'DEFAULT'
        },
        "menuItems": [
          {
            "action": "REPLY"
          },
          {
            "action": "DELETE"
          }]
      })
      .withAuthClient(authClient)
      .execute(function(err, data) {
        if(!!err) {
          d.reject(err)
        } else {
          d.resolve();
        }
      });
  });

  return d.promise;
}

function insertHtmlTimelineItem(authClient, html) {
  var d = Q.defer();

  getMirrorClient().then(function(client) {
    client.mirror.timeline
      .insert({
        "html": html,
        "notification" : {
          level: 'DEFAULT'
        },
        "menuItems": [{"action": "DELETE"}]
      })
      .withAuthClient(authClient)
      .execute(function(err, data) {
        if(!!err) {
          d.reject(err)
        } else {
          d.resolve();
        }
      });
  });

  return d.promise;
}


function subscribe(authClient) {
  var d = Q.defer();

  getMirrorClient().then(function(client) {
    client.mirror.subscriptions
      .insert({
        callbackUrl: process.env.TIMELINE_CALLBACK_URL,
        collection: 'timeline'
      })
      .withAuthClient(authClient)
      .execute(function(err, data) {
        if(!!err) {
          d.reject(err);
        } else {
          d.resolve(data);
        }
      });
  });
  return d.promise;
}

module.exports = {
  getTimelineItems: getTimelineItems,
  getLatestLocation: getLatestLocation,
  insertTextTimelineItem: insertTextTimelineItem,
  insertHtmlTimelineItem: insertHtmlTimelineItem,
  subscribe: subscribe
};


