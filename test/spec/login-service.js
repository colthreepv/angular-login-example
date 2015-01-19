describe('Provider: login-service', function() {
  'use strict';

  var loginService;

  beforeEach(module('loginService'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_loginService_) {
    loginService = _loginService_;
  }));

  describe('loginHandler', function() {
    it('should create loginService.user with JSON from first argument', function() {
      var user = {
        foo: 'bar'
      };

      expect(loginService.user).toEqual({});
      loginService.loginHandler(user);
      expect(loginService.user).toEqual(user);
    });

    it('should extend loginService.user with JSON from subsequent calls', function() {
      var user1 = {
        foo: 'bar'
      };
      var user2 = {
        'baz': 'qux'
      };
      var combined = {
        'foo': 'bar',
        'baz': 'qux'
      };

      expect(loginService.user).toEqual({});
      loginService.loginHandler(user1);
      expect(loginService.user).toEqual(user1);
      loginService.loginHandler(user2);
      expect(loginService.user).toEqual(combined);

    });

    it('should set the user as logged in when called', function() {
      //TODO this is not secure!
      var user = {
        foo: 'bar'
      };

      expect(loginService.isLogged).toBeFalsy();
      loginService.loginHandler(user);
      expect(loginService.isLogged).toBeTruthy();

    });

    it('should set the user role when called', function() {
      var user = {
        userRole: userRoles.admin
      };

      expect(loginService.userRole).toEqual(userRoles.public);
      loginService.loginHandler(user);
      expect(loginService.userRole).toBe(user.userRole);

    });

    it('should set a token', function() {
      var user = {
        token: 'supersecret'
      };

      expect(localStorage.getItem('userToken')).toEqual(null);
      loginService.loginHandler(user);
      expect(localStorage.getItem('userToken')).toEqual(user.token);

    });
  });
});
