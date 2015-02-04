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

  describe('authInterceptor', function () {

    it('should add token to http header to requests when authenticated', inject(function ($http, $httpBackend) {
      var user = {token: 'supersecret'};

      $httpBackend.expectGET('/checkheaders', function (headers) {
        expect(headers['X-Token']).toEqual(user.token);

        return true;//Have to return true to match the headers
      }).respond(200);

      //login should set headers
      loginService.loginHandler(user);

      //Make request which httpBackend will intercept and set the expectation
      $http.get('/checkheaders');

      //Flush triggers the intercept and resolves the $http promise
      $httpBackend.flush();
    }));

    it('should NOT add token to http header to requests when NOT authenticated', inject(function ($http, $httpBackend) {

      $httpBackend.expectGET('/checkheaders', function (headers) {
        expect(headers).not.toContain('X-Token');
        return true;//Have to return true to match the headers
      }).respond(200);

      //Make request which httpBackend will intercept and set the expectation
      $http.get('/checkheaders');

      //Flush triggers the intercept and resolves the $http promise
      $httpBackend.flush();
    }));
  });

  describe('resolvePendingState', function () {
    it('should call loginService when user data successfully retrieved from the server', inject(function ($http, $httpBackend) {

      var user = {'foo': 'bar'};

      spyOn(loginService, 'loginHandler').and.returnValue(user);

      loginService.pendingStateChange = {to: {}}; //pendingState.to.accessLevel is undefined

      expect(loginService.user).toEqual({});
      $httpBackend.expectGET('/foo').respond(200, user);

      loginService.resolvePendingState($http.get('/foo'));

      $httpBackend.flush();

      //loginHandler is called by the http promise success, the first arguments is the user data
      expect(loginService.loginHandler).toHaveBeenCalled();

    }));

    it('should resolve when the "to" access level is undefined after user data successfully retrieved from the server', inject(function ($http, $httpBackend) {

      var user = {'foo': 'bar'};

      spyOn(loginService, 'loginHandler').and.returnValue(user);

      loginService.pendingStateChange = {to: {}}; //pendingState.to.accessLevel is undefined

      expect(loginService.user).toEqual({});

      //Simulate the backend responding with user
      $httpBackend.expectGET('/foo').respond(200, user);

      //Simulate the call made by grandfather
      var checkUserPromise = loginService.resolvePendingState($http.get('/foo'));

      //Add a check to make sure the resolve happens
      var isResolved = false;

      checkUserPromise.then(function resolvedSuccessfully() {
        isResolved = true;
      });

      $httpBackend.flush();

      expect(loginService.doneLoading).toBeTruthy();
      expect(isResolved).toBeTruthy();
    }));

    it('should resolve when the "to" access level matches the userrole bitmask after user data successfully retrieved from the server', inject(function ($http, $httpBackend) {

      var user = {'foo': 'bar'};

      spyOn(loginService, 'loginHandler').and.returnValue(user);

      loginService.userRole = {bitMask: 2};
      loginService.pendingStateChange = {to: {accessLevel: {bitMask: 2}}};

      expect(loginService.user).toEqual({});

      //Simulate the backend responding with user
      $httpBackend.expectGET('/foo').respond(200, user);

      //Simulate the call made by grandfather
      var checkUserPromise = loginService.resolvePendingState($http.get('/foo'));

      //Add a check to make sure the resolve happens
      var isResolved = false;

      checkUserPromise.then(function resolvedSuccessfully() {
        isResolved = true;
      });

      $httpBackend.flush();

      expect(loginService.doneLoading).toBeTruthy();
      expect(isResolved).toBeTruthy();
    }));

    it('should reject when the "to" access level DOES NOT match the userrole bitmask after user data successfully retrieved from the server', inject(function ($http, $httpBackend) {

      var user = {'foo': 'bar'};

      spyOn(loginService, 'loginHandler').and.returnValue(user);

      loginService.userRole = {bitMask: 2};
      loginService.pendingStateChange = {to: {accessLevel: {bitMask: 1}}};

      expect(loginService.user).toEqual({});

      //Simulate the backend responding with user
      $httpBackend.expectGET('/foo').respond(200, user);

      //Simulate the call made by grandfather
      var checkUserPromise = loginService.resolvePendingState($http.get('/foo'));

      //Add a check to make sure the resolve happens
      var isResolved = false;

      checkUserPromise.then(function resolvedSuccessfully() {
        isResolved = true;
      });

      $httpBackend.flush();

      expect(loginService.doneLoading).toBeTruthy();
      expect(isResolved).toBeFalsy();
    }));

  });
});
