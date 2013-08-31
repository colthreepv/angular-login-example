angular.module('angular-login.grandfather', ['ui.router', 'templates-app'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app', {
      abstract: true,
      template: '<ui-view></ui-view>',
      resolve: {
        'login': function (loginService, $http, $q, $state) {
          var checkUser = $q.defer(),
              loginPromise,
              finalPromise,
              pendingState = loginService.pendingStateChange;

          if (pendingState) {
            loginPromise = $http.get('/user');
            // When the $http is done, we register the http result into setPermissions, `data` parameter goes into loginService.setPermissions
            loginPromise.success(loginService.setPermissions);
            loginPromise.error(function () {
              checkUser.reject('tokenexpired');
            });

            /**
             * Define another check after the $http is done, this will *Actually* check if current user can access the requested $state
             */
            finalPromise = $q.all([loginPromise, checkUser.promise]);

            loginPromise.then(function (result) {
              // duplicated logic from loginService $stateChangeStart, slightly different, now we *MUST* have the accessLevel informations.
              if (pendingState.to.accessLevel === undefined || pendingState.to.accessLevel.bitMask & loginService.accessLevel.bitMask) {
                checkUser.resolve();
              } else {
                checkUser.reject('unauthorized');
              }
            });

            return finalPromise;
          } else {
            checkUser.resolve();
          }
          return checkUser.promise;
        }
      }
    });
});
