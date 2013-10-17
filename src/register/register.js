angular.module('angular-login.register', ['angular-login.grandfather'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.register', {
      url: '/register',
      templateUrl: 'register/register.tpl.html',
      controller: 'RegisterController',
      accessLevel: accessLevels.anon
    });
})
.controller('RegisterController', function ($scope, $http) {
  var first = true,
      cancelHttp = null;

  $scope.registerObj = {
    username: undefined,
    password: undefined,
    password2: undefined,
    email: undefined
  };

  $scope.$watch('registerObj', function (newValue, oldValue, scope) {
    if (first) {
      first = !first;
      return;
    }
  }, true);
  $scope.submit = function () {
    // $http here.
  };
});
