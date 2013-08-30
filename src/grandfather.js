angular.module('angular-login.grandfather', ['ui.router'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app', {
      abstract: true,
      template: '<ui-view></ui-view>',
      resolve: {
        'login': function (loginService, $http, $q, $state) {
          var loginDefer = $q.defer(), loginPromise;

          if (loginService.pendingStateChange) {
            loginPromise = $http.get('/user');
            loginPromise.success(loginService.setPermissions);
            return loginPromise;
          } else {
            loginDefer.resolve();
          }
          return loginDefer.promise;
        }
      }
    });
});
