angular.module('angular-login', [
  // login service
  'loginService',
  'angular-login.mock',
  // different app sections
  'angular-login.home',
  'angular-login.private'
])
.config(angular.noop)
.run(angular.noop)
.controller('BodyController', function (loginService, $scope, $state, $log) {
  // Expose $state to the <body> tag
  $scope.$state = $state;
  $scope.loginMe = function (formObj) {
    var loginPromise,
        postObj;

    console.log('submit!', formObj);

    loginPromise = loginService.loginUser({
      username: $scope.username,
      password: $scope.password
    });
    loginPromise.success(function (data) {
      $scope.loggedIn = true;
      angular.extend($scope, data);
    });
  };
});
