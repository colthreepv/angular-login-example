angular.module('angular-login.mock', ['ngMockE2E'])
.config(function ($provide) {
  $provide.decorator('$httpBackend', function ($delegate) {
    var proxy = function (method, url, data, callback, headers) {
      var interceptor = function () {
        var _this = this,
          _arguments = arguments;
        setTimeout(function () {
          callback.apply(_this, _arguments);
        }, 700);
      };
      return $delegate.call(this, method, url, data, interceptor, headers);
    };
    for (var key in $delegate) {
      proxy[key] = $delegate[key];
    }
    return proxy;
  });
})
.run(function ($httpBackend) {
  var userStorage = JSON.parse(localStorage.getItem('userStorage')),
      tokenStorage = JSON.parse(localStorage.getItem('tokenStorage'));

  if (userStorage === null) {
    userStorage = {
      'johnm': { name: 'John', password: 'hello', accessLevel: accessLevels.user, tokens: [] },
      'sandrab': { name: 'Sandra', password: 'world', accessLevel: accessLevels.admin, tokens: [] }
    };
    localStorage.setItem('userStorage', JSON.stringify(userStorage));
  }
  if (tokenStorage === null) {
    tokenStorage = {};
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
  $httpBackend.when('POST', '/login')
    .respond(function (method, url, data, headers) {
      var formData = JSON.parse(data),
          user = userStorage[formData.username],
          newToken,
          tokenObj;
      if (angular.isDefined(user) && user.password === formData.password) {
        newToken = randomUUID();
        user.tokens.push(newToken);
        tokenStorage['newToken'] = formData.username;
        localStorage.setItem('userStorage', JSON.stringify(userStorage));
        localStorage.setItem('tokenStorage', JSON.stringify(tokenStorage));
      }
      return [200, { name: user.name, accessLevel: user.accessLevel, token: newToken }, {}];
    });

  // fakeUser
  $httpBackend.when('GET', '/user')
    .respond(function (method, url, data, headers) {
      // if is present in a registered users array.
      if (headers['X-Token']) {
        return;
      } else {
        return [401, 'auth token invalid or expired', {}];
      }
      debugger;
      return [200, { token: randomUUID(), name: 'John', accessLevel: accessLevels.user }, {}];
    });

  // fakeRegister
  $httpBackend.when('POST', '/register')
    .respond(function (method, url, data, headers) {
      return [200, {}, {}];
    });

});
