angular.module('angular-login', [
  // login service
  'loginService',
  'angular-login.mock',
  // different app sections
  'angular-login.home',
  'angular-login.private',
  'angular-login.error'
])
.config(function ($urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
})
.run(angular.noop)
.controller('BodyController', function ($scope, $state, $stateParams, loginService, $http) {
  // Expose $state and $stateParams to the <body> tag
  $scope.$state = $state;
  $scope.$stateParams = $stateParams;

  // loginService exposed and a new Object containing login user/pwd
  $scope.ls = loginService;
  $scope.login = {};
  $scope.loginMe = function (loginData) {
    loginService.loginUser($http.post('/login', loginData));
  };
  $scope.logoutMe = function () {
    loginService.logoutUser($http.get('/logout'));
  };
});
