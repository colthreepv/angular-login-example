angular.module('loginService', [])
.provider('loginService', function () {
  var userToken = localStorage.getItem('userToken'),
      errorState = 'app.error';

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
            toParams: toParams
          };
        }


        // if the state has undefined accessLevel, anyone can access it.
        // NOTE: if `wrappedService.accessLevel === undefined` means the service still doesn't know the user accessLevel,
        // we need to rely on grandfather resolve, so we let the stateChange success, for now.
        if (to.accessLevel === undefined || wrappedService.accessLevel === undefined || to.accessLevel.bitMask & wrappedService.accessLevel.bitMask) {
          console.log('you are allowed on this page:', to.name);
        } else {
          event.preventDefault();
          // test this
          $state.go(errorState, { error: 'unauthorized' }, { location: false, inherit: false });
        }
      });

      // Gets triggered when a resolve isn't fulfilled
      // da aggiungere un caso in cui il resolve da informazioni solo ad un admin e non ad un user
      // quindi un url ad esempio /resource/admin
      // anche un url /resource/user
      // in questo modo si potrà vedere l'error redirect!
      // anche un caso in cui sono io che faccio fallire una $q cosi si vede l'errore stringa!
      $rootScope.$on('$stateChangeError', function (event, to, toParams, from, fromParams, error) {
        /**
         * This is a very clever way to implement failure redirection.
         * You can use the value of redirectMap, based on the value of the rejection
         * So you can setup DIFFERENT redirections based on different promise errors.
         */
        var errorObj;
        // in case the promise given to resolve function is an $http request
        // the error is a object containing the error and additional informations
        error = (typeof error === 'object') ? error.status.toString() : error;
        // there must be a tokenexpired error.
        if (error === 'tokenexpired') {
          $state.go(errorState, { error: error }, { location: false, inherit: false });
          return wrappedService.logoutUser();
        }
        if (error === 'unauthorized') {
          return $state.go(errorState, { error: error }, { location: false, inherit: false });
        }
        /**
         * Generic redirect handling.
         * If a state transition has been prevented and it's not one of the 2 above errors, means it's a
         * custom error in your application.
         *
         * redirectMap should be defined in the $state(s) that can generate transition errors.
         */
        if (angular.isDefined(to.redirectMap[error])) {
          $state.go(to.redirectMap[error], { error: error });
        } else {
          throw new Error('redirectMap should be defined in the $state(s) that can generate transition errors');
        }
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
      setPermissions: function (userObject) {
        // setup token
        setToken(userObject.token);
        // update userObject
        angular.extend(wrappedService.userObject, userObject);
        // update accessLevel
        wrappedService.accessLevel = userObject.accessLevel;
        return userObject;
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
        // $http.get('/logout'); // fire and forget
        setToken(null);
        // $rootScope.user = undefined;
        // $location.path('/home');
      },
      /**
       * Public properties
       */
      accessLevels: null,
      pendingStateChange: null,
      userObject: {}
    };

    getLoginData();
    managePermissions();

    return wrappedService;
  };
});
