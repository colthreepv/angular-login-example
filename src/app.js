angular.module('angular-login', [
  // login service
  'loginService',
  // different app sections
  'angular-login.home'
])
.config(angular.noop)
.run(angular.noop)
.controller('BodyController', function ($scope, $state) {
  // Expose $state to the <body> tag
  $scope.$state = $state;
  $scope.loginMe = function (formObj) {
    console.log('submit!', formObj);
    $scope.loggedIn = true;
    $scope.name = 'John';
  };
});
