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
  var xhr = false;

  $scope.registerObj = {
    username: undefined,
    password: undefined,
    password2: undefined,
    email: undefined
  };

  $scope.submit = function (formInstance) {
    $http.post('/user', $scope.registerObj)
    .success(function (data, status, headers, config) {
      console.info('post success - ', data);
    })
    .error(function (data, status, headers, config) {
      data.errors.forEach(function (error, index, array) {
        formInstance[error.field].$error[error.name] = true;
      });
      console.info('post error - ', data);
    });
  };
});
