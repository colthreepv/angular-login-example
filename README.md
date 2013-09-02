angular-login-example
=====================

Stand-alone project showing how to make a robust angular application serving access permissions from Server.

**Documentation is currently TBD**, patience is a must-have.

# Table of Contents

  * What this is example for
    * but there are other...?
    * token revocation
    * Full REST API
  * Roadmap to 0.0.1
    * cleanup code
    * spinner support
  * Roadmap to 0.1.0 first release
    * Register new users
    * ngmin and minify
    * more than one README.md, if needed.
    * build/ folder
    * fake email register and activation
    * more user levels
  * Components
    * angular-ui-router
    * angular.js 1.2.0rc1
    * angular-mocks
  * loginService
    * private properties - override in config
      * errorState
    * private methods
      * first
      * second
      * third
    * public methods
      * many
      * many
    * public properties
      * userRole
      * pendingStateChange
  * Logic behind:
    * grandfather, what's that?
    * routingConfig, what's that?
    * synchronous and asynchronous check
  * How to generate correct errors
    * resolve errors
    * $http errors
  * Redirect handling
  * How to declare a $state in this example

# Start the project locally

```bash
$ git clone https://github.com/mrgamer/angular-login-example.git
$ cd angular-login-example
$ npm install && grunt && npm start

# Open browser on http://localhost:8080
```
