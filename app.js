angular.module('angular-login', [
  // login service
  'loginService',
  'angular-login.mock',
  'angular-login.directives',
  // different app sections
  'angular-login.home',
  'angular-login.pages',
  'angular-login.register',
  'angular-login.error',
  // components
  'ngAnimate'
])
.config(function ($urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
})
.run(function ($rootScope) {
  /**
   * $rootScope.doingResolve is a flag useful to display a spinner on changing states.
   * Some states may require remote data so it will take awhile to load.
   */
  $rootScope.doingResolve = false;
  $rootScope.$on('$stateChangeStart', function () {
    $rootScope.doingResolve = true;
  });
  $rootScope.$on('$stateChangeSuccess', function () {
    $rootScope.doingResolve = false;
  });
})
.controller('BodyController', function ($scope, $state, $stateParams, loginService, $http, $timeout) {
  // Expose $state and $stateParams to the <body> tag
  $scope.$state = $state;
  $scope.$stateParams = $stateParams;

  // loginService exposed and a new Object containing login user/pwd
  $scope.ls = loginService;
  $scope.login = {
    working: false,
    wrong: false
  };
  $scope.loginMe = function () {
    // setup promise, and 'working' flag
    var loginPromise = $http.post('/login', $scope.login);
    $scope.login.working = true;
    $scope.login.wrong = false;

    loginService.loginUser(loginPromise);
    loginPromise.error(function () {
      $scope.login.wrong = true;
      $timeout(function () { $scope.login.wrong = false; }, 8000);
    });
    loginPromise.finally(function () {
      $scope.login.working = false;
    });
  };
  $scope.logoutMe = function () {
    loginService.logoutUser($http.get('/logout'));
  };
});

angular.module('angular-login.directives', [])
/**
 * Simple directive to check password equality
 *
 * usage:
 * <input type="password" ng-model="password" password-match="password2">
 * <input type="password" ng-model="password2">
 */
.directive('passwordMatch', function () {
  return {
    restrict: 'A',
    scope: false,
    require: 'ngModel',
    link: function (scope, elem, attrs, controller) {
      var checker = function () {
        // get the value of the first password
        var pwd = scope.$eval(attrs.ngModel);
        // get the value of the other password
        var pwd2 = scope.$eval(attrs.passwordMatch);
        return pwd === pwd2;
      };
      scope.$watch(checker, function (pwdMatch) {
        controller.$setValidity('match', pwdMatch);
      });
    }
  };
})
/**
 * Directive to manage valid/invalid states of remote-validated Data.
 * It stores an internal array of values declared invalid by the server.
 * Generates the form error specified in case the user re-types the same invalid values,
 * clears the errors in case the user changes the ngModel.
 *
 * usage:
 * <input type="email" ng-model="email" remote-validated="used">
 *
 * NOTE: Your controllers have to make the field invalid in case *your* server says so.
 */
.directive('remoteValidated', function () {
  return {
    restrict: 'A',
    scope: false,
    require: 'ngModel',
    link: function (scope, elem, attrs, controller) {
      var invalidItems = [];
      scope.$watch(attrs.ngModel, function (newValue, oldValue) {
        if (newValue) {
          // Check the array of already-bad items
          if (invalidItems.indexOf(newValue) !== -1) {
            return controller.$setValidity(attrs.remoteValidated, false);
          }
          // When the model changes, it checks if the previous value was
          // triggering the error from server-side
          if (controller.$error[attrs.remoteValidated]) {
            invalidItems.push(oldValue);
          }
          controller.$setValidity(attrs.remoteValidated, true);
        }
      });
    }
  };
});

angular.module('angular-login.error', ['angular-login.grandfather'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.error', {
      url: '/error/:error',
      templateUrl: 'error/error.tpl.html',
      accessLevel: accessLevels.public
    });
});

angular.module('angular-login.grandfather', ['ui.router', 'templates-app'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app', {
      abstract: true,
      template: '<ui-view></ui-view>',
      resolve: {
        'login': function (loginService, $q, $http) {
          var roleDefined = $q.defer();

          /**
           * In case there is a pendingStateChange means the user requested a $state,
           * but we don't know yet user's userRole.
           *
           * Calling resolvePendingState makes the loginService retrieve his userRole remotely.
           */
          if (loginService.pendingStateChange) {
            return loginService.resolvePendingState($http.get('/user'));
          } else {
            roleDefined.resolve();
          }
          return roleDefined.promise;
        }
      }
    });
});

angular.module('angular-login.home', ['angular-login.grandfather'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.home', {
      url: '/',
      templateUrl: 'home/home.tpl.html',
      controller: 'HomeController'
    });
})
.controller('HomeController', function ($scope) {
  $scope.users = angular.fromJson(localStorage.getItem('userStorage'));
});

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
        wrappedService.doneLoading = true;
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
          wrappedService.doneLoading = false;
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
          angular.noop(); // requested state can be transitioned to.
        } else {
          event.preventDefault();
          // test this
          $state.go(errorState, { error: 'unauthorized' }, { location: false, inherit: false });
        }
      });

      /**
       * Gets triggered when a resolve isn't fulfilled
       * NOTE: when the user doesn't have required permissions for a state, this event
       *       it's not triggered.
       *
       * In order to redirect to the desired state, the $http status code gets parsed.
       * If it's an HTTP code (ex: 403), could be prefixed with a string (ex: resolvename403),
       * to handle same status codes for different resolve(s).
       * This is defined inside $state.redirectMap.
       */
      $rootScope.$on('$stateChangeError', function (event, to, toParams, from, fromParams, error) {
        /**
         * This is a very clever way to implement failure redirection.
         * You can use the value of redirectMap, based on the value of the rejection
         * So you can setup DIFFERENT redirections based on different promise errors.
         */
        var errorObj, redirectObj;
        // in case the promise given to resolve function is an $http request
        // the error is a object containing the error and additional informations
        error = (typeof error === 'object') ? error.status.toString() : error;
        // in case of a random 4xx/5xx status code from server, user gets loggedout
        // otherwise it *might* forever loop (look call diagram)
        if (/^[45]\d{2}$/.test(error)) {
          wrappedService.logoutUser();
        }
        /**
         * Generic redirect handling.
         * If a state transition has been prevented and it's not one of the 2 above errors, means it's a
         * custom error in your application.
         *
         * redirectMap should be defined in the $state(s) that can generate transition errors.
         */
        if (angular.isDefined(to.redirectMap) && angular.isDefined(to.redirectMap[error])) {
          if (typeof to.redirectMap[error] === 'string') {
            return $state.go(to.redirectMap[error], { error: error }, { location: false, inherit: false });
          } else if (typeof to.redirectMap[error] === 'object') {
            redirectObj = to.redirectMap[error];
            return $state.go(redirectObj.state, { error: redirectObj.prefix + error }, { location: false, inherit: false });
          }
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
        httpPromise.success(this.loginHandler);
      },
      logoutUser: function (httpPromise) {
        /**
         * De-registers the userToken remotely
         * then clears the loginService as it was on startup
         */
        setToken(null);
        this.userRole = userRoles.public;
        this.user = {};
        this.isLogged = false;
        $state.go(logoutState);
      },
      resolvePendingState: function (httpPromise) {
        var checkUser = $q.defer(),
            self = this,
            pendingState = self.pendingStateChange;

        // When the $http is done, we register the http result into loginHandler, `data` parameter goes into loginService.loginHandler
        httpPromise.success(self.loginHandler);

        httpPromise.then(
          function success(httpObj) {
            self.doneLoading = true;
            // duplicated logic from $stateChangeStart, slightly different, now we surely have the userRole informations.
            if (pendingState.to.accessLevel === undefined || pendingState.to.accessLevel.bitMask & self.userRole.bitMask) {
              checkUser.resolve();
            } else {
              checkUser.reject('unauthorized');
            }
          },
          function reject(httpObj) {
            checkUser.reject(httpObj.status.toString());
          }
        );
        /**
         * I setted up the state change inside the promises success/error,
         * so i can safely assign pendingStateChange back to null.
         */
        self.pendingStateChange = null;
        return checkUser.promise;
      },
      /**
       * Public properties
       */
      userRole: null,
      user: {},
      isLogged: null,
      pendingStateChange: null,
      doneLoading: null
    };

    getLoginData();
    managePermissions();

    return wrappedService;
  };
});

/* jshint -W084 */
angular.module('angular-login.mock', ['ngMockE2E'])
.factory('delayHTTP', function ($q, $timeout) {
  return {
    request: function (request) {
      var delayedResponse = $q.defer();
      $timeout(function () {
        delayedResponse.resolve(request);
      }, 700);
      return delayedResponse.promise;
    },
    response: function (response) {
      var deferResponse = $q.defer();

      if (response.config.timeout && response.config.timeout.then) {
        response.config.timeout.then(function () {
          deferResponse.reject();
        });
      } else {
        deferResponse.resolve(response);
      }

      return $timeout(function () {
        deferResponse.resolve(response);
        return deferResponse.promise;
      });
    }
  };
})
// delay HTTP
.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('delayHTTP');
}])
.constant('loginExampleData', {
  version: '0.2.0'
})
.run(function ($httpBackend, $log, loginExampleData) {
  var userStorage = angular.fromJson(localStorage.getItem('userStorage')),
      emailStorage = angular.fromJson(localStorage.getItem('emailStorage')),
      tokenStorage = angular.fromJson(localStorage.getItem('tokenStorage')) || {},
      loginExample = angular.fromJson(localStorage.getItem('loginExample'));

  // Check and corrects old localStorage values, backward-compatibility!
  if (!loginExample || loginExample.version !== loginExampleData.version) {
    userStorage = null;
    tokenStorage = {};
    localStorage.setItem('loginExample', angular.toJson(loginExampleData));
  }

  if (userStorage === null || emailStorage === null) {
    userStorage = {
      'johnm': { name: 'John', username: 'johnm', password: 'hello', email: 'john.dott@myemail.com', userRole: userRoles.user, tokens: [] },
      'sandrab': { name: 'Sandra', username: 'sandrab', password: 'world', email: 'bitter.s@provider.com', userRole: userRoles.admin, tokens: [] }
    };
    emailStorage = {
      'john.dott@myemail.com': 'johnm',
      'bitter.s@provider.com': 'sandrab'
    };
    localStorage.setItem('userStorage', angular.toJson(userStorage));
    localStorage.setItem('emailStorage', angular.toJson(emailStorage));
  }

  /**
   * Generates random Token
   */
  var randomUUID = function () {
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomToken = '';
    for (var i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        randomToken += '';
        continue;
      }
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomToken += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomToken;
  };

  // fakeLogin
  $httpBackend.when('POST', '/login').respond(function (method, url, data, headers) {
    var postData = angular.fromJson(data),
        user = userStorage[postData.username],
        newToken,
        tokenObj;
    $log.info(method, '->', url);

    if (angular.isDefined(user) && user.password === postData.password) {
      newToken = randomUUID();
      user.tokens.push(newToken);
      tokenStorage[newToken] = postData.username;
      localStorage.setItem('userStorage', angular.toJson(userStorage));
      localStorage.setItem('tokenStorage', angular.toJson(tokenStorage));
      return [200, { name: user.name, userRole: user.userRole, token: newToken }, {}];
    } else {
      return [401, 'wrong combination username/password', {}];
    }
  });

  // fakeLogout
  $httpBackend.when('GET', '/logout').respond(function (method, url, data, headers) {
    var queryToken, userTokens;
    $log.info(method, '->', url);

    if (queryToken = headers['X-Token']) {
      if (angular.isDefined(tokenStorage[queryToken])) {
        userTokens = userStorage[tokenStorage[queryToken]].tokens;
        // Update userStorage AND tokenStorage
        userTokens.splice(userTokens.indexOf(queryToken));
        delete tokenStorage[queryToken];
        localStorage.setItem('userStorage', angular.toJson(userStorage));
        localStorage.setItem('tokenStorage', angular.toJson(tokenStorage));
        return [200, {}, {}];
      } else {
        return [401, 'auth token invalid or expired', {}];
      }
    } else {
      return [401, 'auth token invalid or expired', {}];
    }
  });

  // fakeUser
  $httpBackend.when('GET', '/user').respond(function (method, url, data, headers) {
    var queryToken, userObject;
    $log.info(method, '->', url);

    // if is present in a registered users array.
    if (queryToken = headers['X-Token']) {
      if (angular.isDefined(tokenStorage[queryToken])) {
        userObject = userStorage[tokenStorage[queryToken]];
        return [200, { token: queryToken, name: userObject.name, userRole: userObject.userRole }, {}];
      } else {
        return [401, 'auth token invalid or expired', {}];
      }
    } else {
      return [401, 'auth token invalid or expired', {}];
    }
  });

  // fakeRegister
  $httpBackend.when('POST', '/user').respond(function (method, url, data, headers) {
    var postData = angular.fromJson(data),
        newUser,
        errors = [];
    $log.info(method, '->', url);

    if (angular.isDefined(userStorage[postData.username])) {
      errors.push({ field: 'username', name: 'used' });
    }

    if (angular.isDefined(emailStorage[postData.email])) {
      errors.push({ field: 'email', name: 'used' });
    }

    if (errors.length) {
      return [409, {
        valid: false,
        errors: errors
      }, {}];
    } else {
      newUser = angular.extend(postData, { userRole: userRoles[postData.role], tokens: [] });
      delete newUser.role;

      userStorage[newUser.username] = newUser;
      emailStorage[newUser.email] = newUser.username;
      localStorage.setItem('userStorage', angular.toJson(userStorage));
      localStorage.setItem('emailStorage', angular.toJson(emailStorage));
      return [201, { valid: true, creationDate: Date.now() }, {}];
    }
  });

});

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
.controller('RegisterController', function ($scope, $http, $timeout, $state) {
  $scope.xhr = false;
  $scope.redirect = false;

  $scope.registerObj = {
    role: 'user'
  };

  $scope.submit = function (formInstance) {
    // xhr is departing
    $scope.xhr = true;
    $http.post('/user', $scope.registerObj)
    .success(function (data, status, headers, config) {
      console.info('post success - ', data);
      $scope.xhr = false;
      $scope.redirect = true;
      $timeout(function () {
        $state.go('app.home');
      }, 2000);
    })
    .error(function (data, status, headers, config) {
      data.errors.forEach(function (error, index, array) {
        formInstance[error.field].$error[error.name] = true;
      });
      formInstance.$setPristine();
      console.info('post error - ', data);
      $scope.xhr = false;
    });
  };
});

/**
 * Directly from fnakstad
 * https://github.com/fnakstad/angular-client-side-auth/blob/master/client/js/routingConfig.js
 */

(function (exports) {

  var config = {

    /* List all the roles you wish to use in the app
    * You have a max of 31 before the bit shift pushes the accompanying integer out of
    * the memory footprint for an integer
    */
    roles: [
      'public',
      'user',
      'admin'
    ],

    /*
    Build out all the access levels you want referencing the roles listed above
    You can use the "*" symbol to represent access to all roles
     */
    accessLevels: {
      'public' : '*',
      'anon': ['public'],
      'user' : ['user', 'admin'],
      'admin': ['admin']
    }

  };

  /*
    Method to build a distinct bit mask for each role
    It starts off with "1" and shifts the bit to the left for each element in the
    roles array parameter
   */
  function buildRoles(roles) {

    var bitMask = "01";
    var userRoles = {};

    for (var role in roles) {
      var intCode = parseInt(bitMask, 2);
      userRoles[roles[role]] = {
        bitMask: intCode,
        title: roles[role]
      };
      bitMask = (intCode << 1).toString(2);
    }

    return userRoles;
  }

  /*
  This method builds access level bit masks based on the accessLevelDeclaration parameter which must
  contain an array for each access level containing the allowed user roles.
   */
  function buildAccessLevels(accessLevelDeclarations, userRoles) {

    var accessLevels = {},
        resultBitMask,
        role;
    for (var level in accessLevelDeclarations) {

      if (typeof accessLevelDeclarations[level] === 'string') {
        if (accessLevelDeclarations[level] === '*') {

          resultBitMask = '';

          for (role in userRoles) {
            resultBitMask += "1";
          }
          //accessLevels[level] = parseInt(resultBitMask, 2);
          accessLevels[level] = {
            bitMask: parseInt(resultBitMask, 2),
            title: accessLevelDeclarations[level]
          };
        }
        else {
          console.log("Access Control Error: Could not parse '" + accessLevelDeclarations[level] + "' as access definition for level '" + level + "'");
        }
      }
      else {

        resultBitMask = 0;
        for (role in accessLevelDeclarations[level]) {
          if (userRoles.hasOwnProperty(accessLevelDeclarations[level][role])) {
            resultBitMask = resultBitMask | userRoles[accessLevelDeclarations[level][role]].bitMask;
          }
          else {
            console.log("Access Control Error: Could not find role '" + accessLevelDeclarations[level][role] + "' in registered roles while building access for '" + level + "'");
          }
        }
        accessLevels[level] = {
          bitMask: resultBitMask,
          title: accessLevelDeclarations[level][role]
        };
      }
    }

    return accessLevels;
  }


  exports.userRoles = buildRoles(config.roles);
  exports.accessLevels = buildAccessLevels(config.accessLevels, exports.userRoles);

})(typeof exports === 'undefined' ? this : exports);

//@ sourceMappingURL=app.js.map