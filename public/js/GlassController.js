//console.log('hello')
function GlassCtrl($scope, $http) {
  $scope.msg = 'test'


  $scope.sendHello = function() {
    $http.post('/timeline/insert/html', {
      message: $scope.text
    }).success(function(){
        console.log('success');
    })
  }
}