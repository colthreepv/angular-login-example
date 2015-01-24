angular-login-example [![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/mrgamer/angular-login-example/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
=====================

Stand-alone project showing how to make a robust angular application serving access permissions from Server.

#### Features in modern releases
A new (polishing) release has been in work for the last months, differences are only in the demo app, not in the service.

  * You can now add users in the demo, and they gets displayed in homepage.
  * Style is way more polished, I hope you can find useful snippets out of it.
  * Registration form provides a nice error feedback, you can dig into the code for the details.
  * All the `ngMock` requests gets printed in the console!

# Table of Contents

  * [What this is example for](#what-is-this-example-for)
    * [but there are other...?](#but-there-are-other)
    * [Token Revocation](#token-revocation)
  * [Libraries Used](#libraries-used)
    * [angular.js](#angularjs)
    * [angular-ui-router](#angular-ui-router)
    * [angular-mocks](#angular-mocks)
  * [loginService](#loginservice)
    * [Overridable Properties](#overridable-properties)
      * [userToken](#usertoken)
      * [errorState](#errorstate)
      * [logoutState](#logoutstate)
    * [Private Methods](#private-methods)
      * [getLoginData](#getlogindata)
      * [setHeaders](#setheaders)
      * [setToken](#settoken)
      * [managePermissions](#managepermissions)
        * [$stateChangeStart](#statechangestart)
        * [$stateChangeSuccess](#statechangesuccess)
        * [$stateChangeError](#statechangeerror)
    * [Public Methods](#public-methods)
      * [loginHandler](#loginhandler)
      * [loginUser](#loginuser)
      * [logoutUser](#logoutuser)
      * [resolvePendingState](#resolvependingstate)
    * [Public Properties](#public-properties)
      * [userRole](#userrole)
      * [user](#user)
      * [isLogged](#islogged)
      * [pendingStateChange](#pendingstatechange)
      * [doneLoading](#doneloading)
  * [Logic behind](#logic-behind)
    * [grandfather, what's that?](#grandfather-whats-that)
    * [routingConfig, what's that?](#routing-config-whats-that)
    * [synchronous and asynchronous check](#synchronous-and-asynchronous-check)
    * [call schema](#call-schema)
  * [How to generate correct errors](#how-to-generate-correct-errors)
    * [`resolve` errors](#resolve-errors)
    * [`$http` errors](#http-errors)
  * [Redirect handling](#redirect-handling)
  * [How to declare a $state](#how-to-declare-a-state)

# Start the project locally

```bash
$ git clone https://github.com/mrgamer/angular-login-example.git
$ cd angular-login-example
$ npm install && bower install && grunt

# Open browser on http://localhost:8080
```

# TL;DR i wanna make it work asap!
Clone the repo, and try declaring a new state with [_How to declare a state_][how-to-declare-a-state]; altough i recommend reading _some_ of the page in order to understand the implications of what you're doing!

# What is this example for:
This project is an example about how to build a very robust login system using AngularJS.
It manages tokens for users to login, they can be managed customly server-side (server side is absent on this demo), you can make them expire/change permissions without worrying about leaving a non-consistant state on the client side.
  
**PLEASE NOTE:** this is an _example_ because it's just a demostration, and can act as a starting point for your implementation, if you're looking for a library that gets login done in your AngularJS application in 5 minutes, this is not what this project is about!

## but there are other...?
Yes! There are other projects trying to cover authentication limitations of AngularJS vs server-side solutions, i would recommend [fnakstad's project][angular-client-side-auth], and [his blogposts][fnakstad-blogpost]. There is also [another project][http-interceptor] about managing non-authorized http requests.

The main differences in fnakstad's implementation against this one, is that he serves a cookie upfront when serving the index.html page; this cookie has all the information needed regarding the user permissions.

I really didn't want to mess with cookies in my client-side code.  
A **note** about cookies: they are handled in an "uncommon" way in ExpressJS, they are not "rolling-cookies", it's a clever implementation to me, but it's not what a php/.net developer expects (or your boss expects!).

Secondly, this works with a RESTful API service!

| functionality        | my implementation | fnakstad's |
| -------------        | :---------------: | :--------: |
| Simplicity           | **✖**             | **✔**      |
| No dependencies      | **✖**             | **✔**      |
| Easier compatibility | **✖**             | **✔**      |
| No server changes    | **✔**             | **✖**      |
| RESTful support      | **✔**             | **✖**      |
| Handles errors       | **✔**             | **✖**      |
| "hackish"            | **✖**             | **✔**      |
| less code recursion  | **✖**             | **✔**      |

## Token Revocation
In a decently-sized application user banning and authorization revocation might be an important of the login department.  
Doing this using `cookies` it's tricky, ExpressJS or any other backend, usually doesn't give you direct access to the cookie Array.  
  
The usual workaround is to write an userToken inside the `cookie` and then revoke that token, when revoked you have to clear the `cookie`.  
As personal taste, i haven't found it particularly elegant, so a more radical/direct approach.

# Libraries used

## angular.js
You should know this one :-)
In this release the dev team has put routing in a separate file because there are alternative projects like... 

## angular-ui-router
This is the star here!
After messing my life using libraries like [backbone-layoutmanager][backbone-layoutmanager], i can say this is a far more thinked solution, incredibly stable, and elegant solution to be only at version 0.2.0!

## angular-mocks
This part of AngularJS kit is made mainly for testing purposes, on this demo is used to simulate a backend server with 700ms response time.

# loginService

## Overridable Properties
The following properties are overridable at `config` time, injecting `loginServiceProvider`.

Example:
```javascript
angular.module('myapp.module', [])
.config(function (loginServiceProvider) {
  errorState = 'myapp.OriginalWayToError';
  userToken = '9088mmmll18992jn';
});
```

### userToken
Default value is obtained through `localStorage.getItem('userToken')`.  
You can override this and use cookies, sqlite, anything custom works aswell (from URL? Ex: `/somepath?userToken=XX992mm2Yy1m` ).

### errorState
It's a string, the name of a the default state that handles the `$stateChangeError`.  
In the example, this state comes with a parameter in the URL, **PLEASE NOTE** that a state _must_ have a parameter in the url, even if it the parameters gets passed by `$state.go` (and not writing them actually in the URL).  
If the parameters are not _"registered"_ in the url, they get filtered and never reach `$stateParams`.

### logoutState
It's a string, the name of the state the user gets redirected after the `logoutUser()` has been processed.

## Private Methods

### getLoginData
Function that gets called on the first initialization of the provider.  
It reads the `userToken`, and if it's set, sets the `$http` headers.

### setHeaders
Function called by the previous one, and by the next one.  
It is a setter for `$http.defaults.headers`, nothing more.

### setToken
Function that registers the user in the `localStorage` (in this implementation).  
Then calls `setHeaders`, to make sure headers are coherent with the token given.

### managePermissions
Function that gets called on the first initialization of the provider.  
Registers the listeners on `$stateChangeStart`, `$stateChangeSuccess`, `$stateChangeError`, in order to manage permissions and error redirection.

#### $stateChangeStart
Synchronous check on permissions, if the service _already_ has the informations about the user (in short: if it's an anonymous user), authorize or denies it.
Handles spinner appearance.  

#### $stateChangeSuccess
Handles spinner disappear.

#### $stateChangeError
Manages error redirection in case of any `resolve` fails, even the [grandfather][grandfather] one.


## Public Methods

### loginHandler
Important function that gets called once the [grandfather][grandfather] receives the informations from the server.  
Arguments should be ```function (data, status, headers, config)``` the same as [`$http.success`/`$http.error`][angular-http]  
  
It updates `loginService.user` with the JSON _(that should be)_ in the first argument.

This is the place where to put custom logic in case you don't have a server that gives you a correct `userRole`, you can generate it manually looking at other (custom) informations given by the server response.

### loginUser
Accepts as _only_ argument an `httpPromise`, it's usually called from a controller, and simply calls the above `loginHandler` (for now).

### logoutUser
Accepts as _only_ argument an `httpPromise`, it redirects the user to the [`logoutState`][logoutState].

### resolvePendingState
Function used in the [grandfather][grandfather] `resolve`, it includes an asynchronous check on permissions.  
Returns a `$q` [promise][angular-promise] that gets resolved in case the user can access the requested state, rejected otherwise.

## Public Properties

### userRole
This property might have 2 states: `null`, or a valid `userRole` from [`routing-config.js`][routing-config]

### user
This property gets updated by [`loginHandler`][loginHandler], pay attention, this gets done using [`angular.extend`][angular-extend].

### isLogged
Boolean property indicating if the user is logged with an userRole different than `userRoles.anonymous`, useful to display the user status in your AngularJS application.

### pendingStateChange
Boolean property indicating if the `loginService` is waiting for the grandfather's resolve to be completed, in order to check if the user _can_ or _cannot_ access the requested state.

### doneLoading
Boolean property, might have 3 states: `null`, `false`, `true`.  
`null`: loginService hasn't done it's work yet.  
`false`: loginService is waiting for some `$http` promise to get completed  
`true`: loginService got answer from `$http` so the values must be considered **final**.  

Should be handy for displaying loading spinners, as done on this example.

# Logic behind
While this demostration has some code behind, the user checking problem in a Single-Page Application is actually more a _logic_ problem (when to check permissions? how to get required informations?), instead of a coding-problem.

## grandfather, what's that?
As you can see if you meddle with the code, the so-called _grandfather_ is an [_abstract_][angular-ui-router-abstractstate] state that is the father of all the states.  

![diagram](https://docs.google.com/drawings/d/10-DoPgYlNInXxzmtHaGKfGFdYeNzJ4AWKvd1bYcmV8Y/pub?w=960&amp;h=720)

The state logic in angular-ui-router is based off a N-ary state tree.  
The root of this tree is the grandfather, being _abstract_ only means it gets executed but cannot be transitioned into, exactly what we need check permissions asynchronously.

## routing-config, what's that?
In the app there is a file so called `routing-config.js` completely taken from [fnakstad project](https://github.com/fnakstad/angular-client-side-auth/blob/master/client/js/routingConfig.js).  
I think it's a clever and handy bit-based security system.

## synchronous and asynchronous check
In this demo you can see there is a double check on user permissions to transition to a state:

The former is a synchronous check on all the `$stateChangeStart` events, this must be synchronous because events for their nature can only be prevented in a sync-way.
But since we need it to do a server-side request the first **REAL** check is done after an http request.

The latter is inside the [`resolvePendingstate`](#resolvependingstate) method, called from the grandfather state in this example, just after it obtained the valid user informations to let the user access a state or not.

## call schema
Here's a brief call schema of the app and the service, and how they interact with the user request.  
Bare in mind this is for the user to get a general idea, the real amount of calls might be higher (or slightly different).  

[![call schema](https://www.lucidchart.com/publicSegments/view/523d9c78-8e7c-4663-9f73-1c850a00808f/image.png)](https://www.lucidchart.com/publicSegments/view/523d9c78-8e7c-4663-9f73-1c850a00808f/image.png)

# How to generate correct errors

## resolve errors
Custom errors can be generated in your own `resolve`(s), for example:

```javascript
angular.module('myapp.module', [])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.somestate', {
      url: '/random/url',
      resolve: {
        'resourceNeeded': function ($q) {
          var strangeDeferred = $q.defer();
          if (Math.random() * 10 > 5) {
            strangeDeferred.resolve('you have been lucky');
          } else {
            if (Math.random() * 10 > 5) {
              strangeDeferred.reject('not lucky enough');
            } else {
              strangeDeferred.reject('real bad luck');
            }
          }
          return strangeDeferred.promise;
        }
      }
    });
})
```
Will generate a `'not lucky enough' || 'real bad luck'`  error, into the [$stateChangeError][$stateChangeError] handler.  
The default behaviour is to redirect to [`errorState`][errorState].  
  
But if you want a redirect to a custom state, you just have to add this to the previous example:

```javascript
angular.module('myapp.module', [])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.somestate', {
      url: '/random/url',
      resolve: '', /* previous resolve here */
      redirectMap: {
        'not lucky enough': { state: 'app.error', prefix: 'luck' },
        'real bad luck': 'app.specialBadluck'
      }
    });
})
```

**IMPORTANT NOTE:** if you decide to use the object version, `prefix` is _not_ optional, if you don't want a prefix just use `''`.  

The object version is _mostly_ in case there is a state that handles **many** errors, and you want to differentiate them, using a string prefix.  
The string version is shorter and more usable, use what's more appropriate for you.

## $http errors
`$http` errors gets handled in a _very similar_ way, the error is based on the `statusCode` converted to string given by the `httpPromise.error`.  
Example:

```javascript
angular.module('myapp.module', [])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.criticalState', {
      url: '/random/url',
      resolve: {
        'httpRequestNeeded': function ($http) {
          /* let's suppose the responding statusCode is 409 */
          return $http.get('/whatever/url');
        }
      },
      redirectMap: {
        '409': { state: 'app.httpErrors', prefix: 'criticalState' }
      }
    });
});
```
And in the `app.httpErrors`'s state template:

```html
<div ng-switch="$stateParams.error">
  <p ng-switch-when="criticalState409">httpRequestNeeded has failed to complete, this is fail.</p>
  <p ng-switch-when="409">Generic request responded with a 409.</p>
  <p ng-switch-when="401">Unauthorized!</p>
  <p ng-switch-default>Random HTTP Error occurred!</p>
</div ng-switch>
```

# Redirect Handling
This example using AngularJS 1.2.0rc1 doesn't have `$routeProvider` but angular-ui-router has `$urlRouterProvider`, as shown on `app.js` this is sufficient to declare redirects.  

Use his [_very well written_ wiki to read howto][angular-ui-router-urlprovider]

# How to declare a state
The correct way to declare a state for your application is to have it depend on `app.grandfather`.  
Also the state needs to be called `'app.something'`, because the grandfather state is called `'app'` in a way to be the _father_ of any state.

For example a section of your single-page-application might be declared as `funny.js`:

```javascript
angular.module('myapp.funny', ['myapp.grandfather'])
.config(function ($stateProvider) {
  $stateProvider
    .state('app.funny', {
      url: '/funny',
      templateUrl: '/funny/funny.tpl.html',
      controller: 'FunnyController',
      resolve {
        'getRandomFunnyFacts': function ($http) {
          return $http.get('/funnygenerator');
        }
      },
      redirectMap: {
        'noFunFound': 'app.sadError'
      }
    });
})
.controller('FunnyController', function ($scope, getRandomFunnyFacts) {
  /* suppose the getRandomFunnyFacts is a JSON Array, we'll get the latest added funny fact */
  $scope.phrase = getRandomFunnyFacts.pop();
});
```


  [angular-client-side-auth]: https://github.com/fnakstad/angular-client-side-auth
  [fnakstad-blogpost]: http://www.frederiknakstad.com/authentication-in-single-page-applications-with-angular-js/
  [http-interceptor]: https://github.com/witoldsz/angular-http-auth
  [backbone-layoutmanager]: https://github.com/tbranyen/backbone.layoutmanager

  [angular-http]: http://docs.angularjs.org/api/ng.$http
  [angular-promise]: http://docs.angularjs.org/api/ng.$q
  [angular-extend]: http://docs.angularjs.org/api/angular.extend
  [logoutState]: #logoutstate
  [grandfather]: #grandfather
  [loginHandler]: #loginhandler
  [errorState]: #errorstate
  [$stateChangeError]: #statechangeerror
  [routing-config]: #routing-config
  [how-to-declare-a-state]: #how-to-declare-a-state

  [angular-ui-router-urlprovider]: https://github.com/angular-ui/ui-router/wiki/URL-Routing#urlrouterprovider
  [angular-ui-router-abstractstate]: https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views#abstract-states
