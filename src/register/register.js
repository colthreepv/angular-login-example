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
/**
 * Factory service that keeps track of $http requests.
 * Main goal is to cancel $http requests if there is already
 * an ongoing one.
 *
 * Requests that are awaiting response are kept tracked in deferedStore.
 * You can request different url(s) and make them timeout politely in such way
 */
.factory('limitHttp', function ($http, $httpBackend, $rootScope, $q) {
  var cancelQuery = null,
      deferedStore = {};

  return function (method, url) {
    // if we were running a query before,
    // cancel it so it doesn't invoke its success callback
    if (deferedStore[url] && deferedStore[url][method]) {
      deferedStore[url][method].resolve();
    }
    // create a new defered in deferedStore -> url -> methodname
    deferedStore[url] = {};
    deferedStore[url][method] = $q.defer();
    return $http({
      method: method,
      url: url,
      timeout: deferedStore[url][method].promise
    })
    .success(function () {
      deferedStore[url][method] = null;
    });
  };
})
.controller('RegisterController', function ($scope, limitHttp) {
  var first = true,
      cancelHttp = null;

  $scope.registerObj = {
    username: undefined,
    password: undefined,
    password2: undefined,
    email: undefined
  };

  /**
   * continuos form remote checking
   */
  $scope.$watch('registerObj', function (newValue, oldValue, scope) {
    if (first) {
      first = !first;
      return;
    }

    var httpPromise = limitHttp('POST', '/user');
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
