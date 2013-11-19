/* jshint -W084 */
angular.module('angular-login.mock', ['ngMockE2E'])
.factory('delayHTTP', function ($q, $timeout) {
  return {
    request: function (request) {
      var delayedResponse = $q.defer();
      $timeout(function () {
        delayedResponse.resolve(request);
      }, 500);
      return delayedResponse.promise;
    },
    response: function (response) {
      var deferResponse = $q.defer();

      if (response.config.timeout && response.config.timeout.then) {
        response.config.timeout.then(function () {
          console.log('after timeout!');
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
      tokenStorage = angular.fromJson(localStorage.getItem('tokenStorage')) || {},
      loginExample = angular.fromJson(localStorage.getItem('loginExample'));

  // Check and corrects old localStorage values, backward-compatibility!
  if (!loginExample || loginExample.version !== loginExampleData.version) {
    userStorage = null;
    tokenStorage = null;
    localStorage.setItem('loginExample', angular.toJson(loginExampleData));
  }

  if (userStorage === null) {
    userStorage = {
      'johnm': { name: 'John', username: 'johnm', password: 'hello', userRole: userRoles.user, tokens: [] },
      'sandrab': { name: 'Sandra', username: 'sandrab', password: 'world', userRole: userRoles.admin, tokens: [] }
    };
    localStorage.setItem('userStorage', angular.toJson(userStorage));
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
    var formData = angular.fromJson(data),
        user = userStorage[formData.username],
        newToken,
        tokenObj;
    $log.info(method, '->', url);

    if (angular.isDefined(user) && user.password === formData.password) {
      newToken = randomUUID();
      user.tokens.push(newToken);
      tokenStorage[newToken] = formData.username;
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
    var checkOnly = headers['X-Check-Only'],
        errors = [];
    $log.info(method, '->', url);

    console.log('headers', headers);
    if (checkOnly) {
      if (data.password !== data.password2) {
        errors.push({ field: 'password', error: 'match' });
      }

      return [
        200,
        {
          valid: true,
          errors: errors
        },
        {}
      ];
    }
    return [200, {}, {}];
  });

  $httpBackend.when('GET', 'style.css').respond(function (method, url, data, headers) {
    // $log.info(method, '->', url);
    return [200, {}, {}];
  });

});
