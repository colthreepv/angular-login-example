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
.factory('httpQuery', function ($http, $httpBackend, $rootScope, $q) {
  return function (url) {
    var cancelQuery = null;
    return function runQuery(query) {
      // if we were running a query before,
      // cancel it so it doesn't invoke its success callback
      if (cancelQuery) {
        cancelQuery.resolve();
      }
      cancelQuery = $q.defer();
      return $http
        .get(url, {
          timeout: cancelQuery.promise
        })
        .success(function (data, status) {
          console.log('response');
          cancelQuery = null;
        });
    };
  };
})
.controller('RegisterController', function ($scope, httpQuery) {
  var first = true,
      cancelHttp = null;

  $scope.registerObj = {
    username: undefined,
    password: undefined,
    password2: undefined,
    email: undefined
  };

  var someQuery = httpQuery('style.css');

  /**
   * continuos form remote checking
   */
  $scope.$watch('registerObj', function (newValue, oldValue, scope) {
    if (first) {
      first = !first;
      return;
    }

    var httpPromise = someQuery();
    $scope.status = 'loading...';
    httpPromise.success(function (data) {
      $scope.result = data;
      $scope.status = 'done!';
    });
  }, true);

  $scope.submit = function () {
    // $http here.
  };
});
