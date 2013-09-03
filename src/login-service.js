angular.module('loginService', [])
.provider('loginService', function () {
  var userToken = localStorage.getItem('userToken'),
      errorState = 'app.error',
      logoutState = 'app.home';

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
        wrappedService.userRole = userRoles.public;
        wrappedService.isLogged = false;
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
        if (wrappedService.userRole === null) {
          wrappedService.pendingStateChange = {
            to: to,
            toParams: toParams
          };
          return;
        }


        // if the state has undefined accessLevel, anyone can access it.
        // NOTE: if `wrappedService.userRole === undefined` means the service still doesn't know the user role,
        // we need to rely on grandfather resolve, so we let the stateChange success, for now.
        if (to.accessLevel === undefined || to.accessLevel.bitMask & wrappedService.userRole.bitMask) {
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
        // in case of a 'tokenexpired', or a random 5xx status code from server, user gets loggedout
        if (error === 'tokenexpired' || /5\d{2}/.test(error)) {
          wrappedService.logoutUser();
          return $state.go(errorState, { error: error }, { location: false, inherit: false });
        }
        /**
         * Generic redirect handling.
         * If a state transition has been prevented and it's not one of the 2 above errors, means it's a
         * custom error in your application.
         *
         * redirectMap should be defined in the $state(s) that can generate transition errors.
         */
        if (angular.isDefined(to.redirectMap) && angular.isDefined(to.redirectMap[error])) {
          return $state.go(to.redirectMap[error], { error: error });
        }
        return $state.go(errorState, { error: error }, { location: false, inherit: false });
      });
    };

    /**
     * High level, public methods
     */

    var wrappedService = {
      loginHandler: function (user, status, headers, config) {
        /**
         * Custom logic to manually set userRole goes here
         *
         * Commented example shows an userObj coming with a 'completed'
         * property defining if the user has completed his registration process,
         * validating his/her email or not.
         *
         * EXAMPLE:
         * if (user.hasValidatedEmail) {
         *   wrappedService.userRole = userRoles.registered;
         * } else {
         *   wrappedService.userRole = userRoles.invalidEmail;
         *   $state.go('app.nagscreen');
         * }
         */
        // setup token
        setToken(user.token);
        // update user
        angular.extend(wrappedService.user, user);
        // flag true on isLogged
        wrappedService.isLogged = true;
        // update userRole
        wrappedService.userRole = user.userRole;
        return user;
      },
      loginUser: function (httpPromise) {
        httpPromise.success(wrappedService.loginHandler);
      },
      logoutUser: function (httpPromise) {
        /**
         * De-registers the userToken remotely
         * then clears the loginService as it was on startup
         */
        setToken(null);
        wrappedService.userRole = userRoles.public;
        wrappedService.user = {};
        wrappedService.isLogged = false;
        $state.go(logoutState);
      },
      resolvePendingState: function (httpPromise) {
        var checkUser = $q.defer(),
            finalPromise,
            pendingState = wrappedService.pendingStateChange;

        // When the $http is done, we register the http result into loginHandler, `data` parameter goes into loginService.loginHandler
        httpPromise.success(wrappedService.loginHandler);
        httpPromise.error(function () {
          checkUser.reject('tokenexpired');
        });

        /**
         * Define another check after the $http is done, this will *Actually* check if current user can access the requested $state
         */
        finalPromise = $q.all([httpPromise, checkUser.promise]);

        httpPromise.then(function (result) {
          wrappedService.isLogged = true;
          // duplicated logic from loginService $stateChangeStart, slightly different, now we *MUST* have the userRole informations.
          if (pendingState.to.accessLevel === undefined || pendingState.to.accessLevel.bitMask & wrappedService.userRole.bitMask) {
            checkUser.resolve();
          } else {
            checkUser.reject('unauthorized');
          }
        });
        wrappedService.pendingStateChange = null;
        return finalPromise;
      },
      /**
       * Public properties
       */
      userRole: null,
      user: {},
      isLogged: null,
      pendingStateChange: null
    };

    getLoginData();
    managePermissions();

    return wrappedService;
  };
});
