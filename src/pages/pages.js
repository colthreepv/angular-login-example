angular.module('angular-login.pages', ['angular-login.grandfather'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.admin', {
      url: '/admin',
      templateUrl: 'pages/admin.tpl.html',
      accessLevel: accessLevels.admin
    })
    .state('app.user', {
      url: '/user',
      templateUrl: 'pages/user.tpl.html',
      accessLevel: accessLevels.user
    });
});
