//console.log('hello')
function GlassCtrl($scope, $http) {
  $scope.msg = 'test'


  $scope.sendHello = function() {
    $http.post('/timeline/insert/text', {
      message: $scope.text
    }).success(function(){
        console.log('success');
    })
  }
}