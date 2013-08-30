angular.module('angular-login.delay', ['ngMockE2E'])
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
  /**
   * Generates random Token
   */
  var fakeUserObj = function (username, validated) {
    var randomRank = Math.floor(Math.random() * 100),
        randomCredits = Math.floor(Math.random() * 10000),
        randomUUID = function () {
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

    return {
      token: randomUUID(),
      type: 'bee',
      username: username,
      validated: validated,
      profile: {},
      rank: randomRank,
      trainer: false,
      credits: randomCredits,
      geoareas: []
    };
  };

  var fakeLogin = function () {
    $httpBackend.when('POST', '/login')
      .respond(function (method, url, data, headers) {
        debugger;
        return [200, { name: 'George', accessMask: accessLevels.bee }, {}];
      });
  };
  var fakeRegister = function () {};

});
