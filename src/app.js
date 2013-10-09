angular.module('angular-login', [
  // login service
  'loginService',
  'angular-login.mock',
  // different app sections
  'angular-login.home',
  'angular-login.private',
  'angular-login.register',
  'angular-login.error',
  // components
  'ngAnimate'
])
.config(function ($urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
})
.run(function ($rootScope) {
  /**
   * $rootScope.doingResolve is a flag useful to display a spinner on changing states.
   * Some states may require remote data so it will take awhile to load.
   */
  $rootScope.doingResolve = false;
  $rootScope.$on('$stateChangeStart', function () {
    $rootScope.doingResolve = true;
  });
  $rootScope.$on('$stateChangeSuccess', function () {
    $rootScope.doingResolve = false;
  });
})
.controller('BodyController', function ($scope, $state, $stateParams, loginService, $http) {
  // Expose $state and $stateParams to the <body> tag
  $scope.$state = $state;
  $scope.$stateParams = $stateParams;

  // loginService exposed and a new Object containing login user/pwd
  $scope.ls = loginService;
  $scope.login = {
    working: false
  };
  $scope.loginMe = function () {
    // setup promise, and 'working' flag
    var loginPromise = $http.post('/login', $scope.login);
    $scope.login.working = true;

    loginService.loginUser(loginPromise);
    loginPromise.success(function () {
      $scope.login = { working: false };
    });
    loginPromise.finally(function () {
      $scope.login.working = false;
    });
  };
  $scope.logoutMe = function () {
    loginService.logoutUser($http.get('/logout'));
  };
});
