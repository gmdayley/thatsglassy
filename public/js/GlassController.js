
function GlassCtrl($scope, $http) {
  $scope.sendText = function() {
    $http
      .post('/timeline/insert/text', {
        message: $scope.text
      })
      .success(function(){
        console.log('success');
      });
  };

  $scope.sendHtml = function() {
    $http
      .post('/timeline/insert/html')
      .success(function(){
        console.log('success');
      });
  };

  $scope.getLocation = function() {
    $http
      .get('/location')
      .success(function(location){
        $scope.location = location;
      });
  };

  $scope.sendFlickr = function() {
    $http
      .post('/flickr')
      .success(function(){
        console.log('success');
      });
  };
}