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

  describe('managePermissions', function () {

    it('should flag grandfather to resolve the user role when loginService.userRole is null', inject(function ($rootScope) {
      loginService.doneLoading = true;
      loginService.pendingStateChange = null;

      var to = {'thisis': 'to'};
      var toParams = {'thisis': 'toparams'};

      loginService.userRole = null;
      $rootScope.$broadcast('$stateChangeStart', to, toParams); //trigger the managePermission $on function

      //doneLoading= false triggers the spinner, pendingStateChange triggers grandfather to send a request to the server for role
      expect(loginService.doneLoading).toBe(false);
      expect(loginService.pendingStateChange.to).toEqual(to);
      expect(loginService.pendingStateChange.toParams).toEqual(toParams);
    }));

    it('should allow state transition if the "to" state has no access level set', inject(function ($rootScope) {
      loginService.doneLoading = true;
      loginService.pendingStateChange = null;

      var to = {'this': 'has_no_element_called_access_level'};

      loginService.userRole = 'foo';
      $rootScope.$broadcast('$stateChangeStart', to); //trigger the managePermission $on function

      expect(loginService.doneLoading).toBe(true);
      expect(loginService.pendingStateChange).toBe(null);
    }));

    it('should allow state transition if userRole bitmask matches "to" accessLevel bitmask', inject(function ($rootScope) {
      loginService.doneLoading = true;
      loginService.pendingStateChange = null;

      var to = {
        accessLevel: {
          bitMask: 2
        }
      };

      loginService.userRole = {
        bitMask: 2
      };

      $rootScope.$broadcast('$stateChangeStart', to); //trigger the managePermission $on function

      expect(loginService.doneLoading).toBe(true);
      expect(loginService.pendingStateChange).toBe(null);
    }));

    it('should go to error state transition if userRole bitmask does NOT match "to" accessLevel bitmask', inject(function ($rootScope, $state) {
      spyOn($rootScope, '$emit').and.returnValue('foo');
      spyOn($state, 'go').and.returnValue('foo');

      var to = {
        accessLevel: {
          bitMask: 2
        }
      };

      loginService.userRole = {
        bitMask: 1
      }; // doesn't match the to.accessLevel.bitMask

      $rootScope.$broadcast('$stateChangeStart', to); //trigger the managePermission $on function
      expect($rootScope.$emit).toHaveBeenCalled();
      expect($state.go).toHaveBeenCalled();
    }));

    it('should call logoutUser when a 4xx authorization error occurs', inject(function ($rootScope, $state) {
      spyOn(loginService, 'logoutUser').and.callThrough();
      spyOn($state, 'go').and.returnValue('foo');//stub $state.go since it's called at the end when an error occurred

      //Broadcast the stateChangeError as if we're ui-router. we add a 401 error to trigger the logoutUser cal
      $rootScope.$broadcast('$stateChangeError', {}, {}, {}, {}, 401);
      expect(loginService.logoutUser).toHaveBeenCalled();
    }));

    it('should call logoutUser when a 5xx server error occurs', inject(function ($rootScope, $state) {
      spyOn(loginService, 'logoutUser').and.callThrough();
      spyOn($state, 'go').and.returnValue('foo');//stub $state.go since it's called at the end when an error occurred

      //Broadcast the stateChangeError as if we're ui-router. we add a 401 error to trigger the logoutUser cal
      $rootScope.$broadcast('$stateChangeError', {}, {}, {}, {}, 500);
      expect(loginService.logoutUser).toHaveBeenCalled();
    }));
  });
});
