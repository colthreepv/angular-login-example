angular.module('angular-login.private', ['angular-login.grandfather'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.private', {
      url: '/private',
      templateUrl: 'private/private.tpl.html',
      accessLevel: accessLevels.admin
    });
});
