var Flickr = require('node-flickr');
var flickr = new Flickr({"api_key": process.env.FLICKR_API_KEY});
var Q = require('q');

module.exports = {
  randomFromLatLng: function(lat, lng) {
    var d = Q.defer();

    flickr.get("photos.search", {lat: lat, lon: lng, extras: ["description"]}, function(result) {
      var photos = result.photos["photo"];
      var photo = photos[Math.floor(Math.random() * photos.length)];
      console.log(photo);
      var imageUrl = 'http://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg'
      d.resolve({
        url: imageUrl,
        description: photo.description._content
      });
    });

    return d.promise;
  }
};
