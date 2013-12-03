var Q = require('q');
var googleapis = require('googleapis');
var mirrorClient;

/**
 * Loads the Google Mirror api if needed and returns it
 *
 * @returns {promise|*|Q.promise}
 */
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

/**
 * Gets the latest known location of the users glass device
 *
 * @param authClient
 * @returns {promise|*|Q.promise}
 */
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

/**
 * Gets all timeline items for this glass app
 *
 * @param authClient
 * @returns {promise|*|Q.promise}
 */
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

/**
 * Inserts a text timeline card into the users timeline
 *
 * @param authClient
 * @param text
 * @returns {promise|*|Q.promise}
 */
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

/**
 * Inserts an html card into the users timeline
 *
 * @param authClient
 * @param html
 * @returns {promise|*|Q.promise}
 */
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

/**
 * Subscribe to the users timeline events for this app
 *
 * @param authClient
 * @returns {promise|*|Q.promise}
 */
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


/**
 * Unsubscribe to a users timeline
 *
 * @param authClient
 */
function unsubscribe(authClient) {
  var d = Q.defer();

  getMirrorClient().then(function(client) {
    client.mirror.subscriptions
      .delete({
        id: 'timeline'
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

/**
 * List current subscriptions
 *
 * @param authClient
 * @returns {promise|*|Q.promise}
 */
function listSubscriptions(authClient) {
  var d = Q.defer();

  getMirrorClient().then(function(client) {
    client.mirror.subscriptions
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

/**
 * Get a timeline item by id
 *
 * @param authClient
 * @param id
 * @returns {promise|*|Q.promise}
 */
function getTimelineItem(authClient, id) {
  var d = Q.defer();

  getMirrorClient().then(function(client) {
    client.mirror.timeline
      .get({
        id: id
      })
      .withAuthClient(authClient)
      .execute(function(err, data) {
        if(!!err) {
          console.log(err);
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
  getTimelineItem: getTimelineItem,
  getLatestLocation: getLatestLocation,
  insertTextTimelineItem: insertTextTimelineItem,
  insertHtmlTimelineItem: insertHtmlTimelineItem,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  listSubscriptions: listSubscriptions
};


