angular.module('angular-login.home', ['angular-login.grandfather'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.home', {
      url: '/home',
      templateUrl: 'src/home/home.tpl.html'
    });
});
