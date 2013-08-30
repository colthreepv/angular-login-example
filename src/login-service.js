angular.module('loginService', [])
.provider('loginService', function () {
  var userToken = localStorage.getItem('userToken'),
      errorState = 'root';

  this.$get = function ($rootScope, $http, $q, $state) {
    /**
     * Low-level, private functions.
     */

    var setHeaders = function (token) {
      if (!token) {
        delete $http.defaults.headers.common['X-Token'];
        return;
      }
      $http.defaults.headers.common['X-Token'] = token.toString();
    };

    var setToken = function (token) {
      if (!token) {
        localStorage.removeItem('userToken');
      } else {
        localStorage.setItem('userToken', token);
      }
      setHeaders(token);
    };

    var getLoginData = function () {
      if (userToken) {
        setHeaders(userToken);
      } else {
        wrappedService.accessLevels = accessLevels.anon;
      }
    };

    var managePermissions = function () {
      // Register routing function.
      $rootScope.$on('$stateChangeStart', function (event, to, toParams, from, fromParams) {

        /**
         * $stateChangeStart is a synchronous check to the accessLevels property
         * if it's not set, it will setup a pendingStateChange and will let
         * the grandfather resolve do his job.
         *
         * In short:
         * If accessLevels is still undefined, it let the user change the state.
         * Grandfather.resolve will either let the user in or reject the promise later!
         */
        if (wrappedService.accessLevels === null) {
          wrappedService.pendingStateChange = {
            to: to,
            toParams: toParams,
            levelsRequired: to.accessLevel
          };
        }


        // Se la route non ha una accessMask specificata, tutti possono accederle
        if (to.accessMask === undefined || to.accessMask & $rootScope.user.accessMask) {
          console.log('you are allowed on this page:', to.name);
        } else {
          $rootScope.notify = { title: 'Non autorizzato', message: 'I tuoi permessi non sono adeguati alla pagina richiesta' };
          $location.path('/home').replace();
        }
      });

      // Manages all the route Erorrs, it could have been much more detailed
      $rootScope.$on('$stateChangeError', function (event, to, toParams, from, fromParams, error) {
        /**
         * This is a very clever way to implement failure redirection.
         * You can use the value of redirectMap, based on the value of the rejection
         * So you can setup DIFFERENT redirections based on different promise errors.
         */
        var errorObj;
        // Nel caso resolve contenga una chiamata diretta ad $http, la risposta rejection è un oggetto
        error = (typeof error === 'object') ? error.status.toString() : error;
        if (error === '401') {
          $rootScope.notify = { title: 'Sessione scaduta', message: 'Per favore effettua di nuovo il login.' };
          $location.path('/home').replace();
          return logoutUser();
        }
        errorObj = to.redirectMap[error];
        $rootScope.notify = { title: 'Errore!!!', message: errorObj.message };
        $location.path(errorObj.url).replace();
      });
    };

    /**
     * High level, public methods
     */

    var wrappedService = {
      /**
       * Custom logic to manually set accessMask goes here
       *
       * Commented example shows an userObj coming with a 'completed'
       * property defining if the user has completed his registration process,
       * validating his/her email or not.
       */
      // if (userObj.completed) {
      //   userObj.accessLevel = accessLevels.completed;
      // } else {
      //   userObj.accessMask = accessLevels.noncompleted;
      //   $state.go('complete.registration');
      // }
      setPermissions: function (userObj) {
        // write token
        setToken(userObj.token);
        return userObj;
      },
      loginUser: function (postObj) {
        var loginPromise = $http.post('/login', postObj)
          .success(this.setPermissions)
          .error(function (data, status, headers, config) {
            if (status === 420) {
              $rootScope.appError = { title: 'E-Mail non attivata', message: 'Non potrai entrare finchè l\'email non sarà verificata, <a href="#/register/token/' + username + '">clicca qui</a> per richiedere una nuova email di verifica.'};
            }
            $rootScope.user = { accessMask: accessLevels.anonymous };
          });
        return loginPromise;
      },
      logoutUser: function () {
        $http.get('/logout'); // fire and forget
        setToken(null);
        $rootScope.user = undefined;
        $location.path('/home');
      },
      /**
       * Public properties
       */
      accessLevels: null,
      pendingStateChange: null
    };

    getLoginData();
    managePermissions();

    return wrappedService;
  };
});
