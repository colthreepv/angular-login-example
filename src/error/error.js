angular.module('angular-login.error', ['angular-login.grandfather'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.error', {
      url: '/error/:error',
      templateUrl: 'error/error.tpl.html',
      accessLevel: accessLevels.public
    });
});
