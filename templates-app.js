angular.module('templates-app', ['error/error.tpl.html', 'home/home.tpl.html', 'pages/admin.tpl.html', 'pages/user.tpl.html', 'register/register.tpl.html']);

angular.module("error/error.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("error/error.tpl.html",
    "<div class=\"jumbotron\">\n" +
    "  <h1>Error</h1>\n" +
    "  <div ng-switch=\"$stateParams.error\">\n" +
    "    <p class=\"text-danger\" ng-switch-when=\"unauthorized\">You are not authorized</p>\n" +
    "    <p class=\"text-danger\" ng-switch-when=\"401\">You are not authorized</p>\n" +
    "    <p class=\"text-danger\" ng-switch-default>Some error has occurred</p>\n" +
    "  </div ng-switch>\n" +
    "</div>\n" +
    "");
}]);

angular.module("home/home.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("home/home.tpl.html",
    "<div class=\"jumbotron\">\n" +
    "  <h1>This is home!</h1>\n" +
    "  <p>Everybody can access this page, the other credentials stored are:</p>\n" +
    "  <div ng-repeat=\"user in users\">\n" +
    "    <h2>{{ user.name }}</h2>\n" +
    "    <p ng-class=\"{ 'text-info': user.userRole.title === 'user', 'text-danger': user.userRole.title === 'admin' }\">\n" +
    "      username: {{ user.username }}, password: {{ user.password }}, email: {{ user.email }}, permission: {{ user.userRole.title }}\n" +
    "    </p>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "<h2>native json</h2>\n" +
    "<p>angular provides the real json object</p>\n" +
    "<pre>\n" +
    "  <code>\n" +
    "{{ users | json }}\n" +
    "  </code>\n" +
    "</pre>\n" +
    "\n" +
    "<h2>You can keep track of mocked http requests</h2>\n" +
    "<p>Just open the console of your favourite browser and the ngMock will print out the requests as console.info.</p>\n" +
    "");
}]);

angular.module("pages/admin.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("pages/admin.tpl.html",
    "<div class=\"jumbotron\">\n" +
    "  <h1>Admin interface</h1>\n" +
    "  <p class=\"text-danger\">Only accessible by <b>admins</b></p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("pages/user.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("pages/user.tpl.html",
    "<div class=\"jumbotron\">\n" +
    "  <h1>Page for registered users</h1>\n" +
    "  <p class=\"text-info\">Both <b>users</b> and <b>admins</b> can access to this page!</p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("register/register.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("register/register.tpl.html",
    "<form class=\"form-signin\" name=\"registerForm\" role=\"registration\" ng-submit=\"submit(registerForm)\">\n" +
    "  <div class=\"alert alert-warning\">\n" +
    "    <p class=\"text-center\"><strong>Please NOTE</strong></p>\n" +
    "    <p class=\"text-center\">All the data here is fake, it gets stored in your localStorage, it will <strong>NEVER</strong> leave your browser.</p>\n" +
    "  </div>\n" +
    "  <h2 class=\"form-signin-heading\"><i class=\"fa fa-user\"></i> New User</h2>\n" +
    "  <!--div class=\"form-group\">\n" +
    "    <label for=\"username\" class=\"col-lg-2 control-label\">Email</label>\n" +
    "    <div class=\"col-lg-10\">\n" +
    "      <input type=\"text\" class=\"form-control\" id=\"username\" placeholder=\"Username\">\n" +
    "    </div>\n" +
    "  </div-->\n" +
    "  <div class=\"form-input username\">\n" +
    "    <input type=\"text\" class=\"form-control\" placeholder=\"Username\" name=\"username\" ng-model=\"registerObj.username\" autofocus=\"true\"\n" +
    "      ng-minlength=\"4\" ng-maxlength=\"16\" ng-required=\"true\" remote-validated=\"used\">\n" +
    "    <div class=\"errors\" ng-class=\"{ active: registerForm.username.$invalid && registerForm.username.$dirty }\">\n" +
    "      <div class=\"error ng-hide\" ng-show=\"registerForm.username.$error.minlength\">\n" +
    "        <p>Username is too short!</p>\n" +
    "      </div>\n" +
    "      <div class=\"error ng-hide\" ng-show=\"registerForm.username.$error.maxlength\">\n" +
    "        <p>Max username length is 16, please shorten it.</p>\n" +
    "      </div>\n" +
    "      <div class=\"error ng-hide\" ng-show=\"registerForm.username.$error.used\">\n" +
    "        <p>Username is already taken.</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"form-input name\">\n" +
    "    <input type=\"text\" class=\"form-control\" placeholder=\"Real Name\" name=\"name\" ng-model=\"registerObj.name\" ng-minlength=\"4\" ng-maxlength=\"32\" ng-required=\"true\">\n" +
    "    <div class=\"errors\" ng-class=\"{ active: registerForm.name.$invalid && registerForm.name.$dirty }\">\n" +
    "      <div class=\"error ng-hide\" ng-show=\"registerForm.name.$error.minlength\">\n" +
    "        <p>Provided name is too short!</p>\n" +
    "      </div>\n" +
    "      <div class=\"error ng-hide\" ng-show=\"registerForm.name.$error.maxlength\">\n" +
    "        <p>Max name length is 32, please shorten it.</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"form-input password\">\n" +
    "    <input type=\"password\" class=\"form-control password\" placeholder=\"Password\" name=\"password\" ng-model=\"registerObj.password\" ng-minlength=\"4\" ng-maxlength=\"16\" ng-required=\"true\" password-match=\"registerObj.password2\">\n" +
    "    <input type=\"password\" class=\"form-control password2\" placeholder=\"Repeat Password\" name=\"password2\" ng-model=\"registerObj.password2\">\n" +
    "    <div class=\"errors\" ng-class=\"{ active: registerForm.password.$invalid && registerForm.password.$dirty }\">\n" +
    "      <div class=\"error ng-hide\" ng-show=\"registerForm.password.$error.match\">\n" +
    "        <p>Passwords do not match.</p>\n" +
    "      </div>\n" +
    "      <div class=\"error ng-hide\" ng-show=\"registerForm.password.$error.minlength\">\n" +
    "        <p>For your own safety, use a password longer than 4 characters.</p>\n" +
    "      </div>\n" +
    "      <div class=\"error ng-hide\" ng-show=\"registerForm.password.$error.maxlength\">\n" +
    "        <p>For your own <b>SANITY</b>, use a password shorter than 16 characters.</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"form-input email\">\n" +
    "    <input type=\"email\" class=\"form-control email\" placeholder=\"E-Mail\" name=\"email\" ng-model=\"registerObj.email\" ng-required=\"true\" remote-validated=\"used\">\n" +
    "    <div class=\"errors\" ng-class=\"{ active: registerForm.email.$invalid && registerForm.email.$dirty }\">\n" +
    "      <div class=\"error ng-hide\" ng-show=\"registerForm.email.$error.email\">\n" +
    "        <p>E-Mail seems invalid.</p>\n" +
    "      </div>\n" +
    "      <div class=\"error ng-hide\" ng-show=\"registerForm.email.$error.used\">\n" +
    "        <p>E-Mail is already taken.</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div class=\"form-input role\">\n" +
    "    <select class=\"form-control\" name=\"role\" ng-model=\"registerObj.role\">\n" +
    "      <option value=\"user\" selected>User</option>\n" +
    "      <option value=\"admin\">Administrator</option>\n" +
    "    </select>\n" +
    "  </div>\n" +
    "  <button class=\"btn btn-lg btn-block\" type=\"submit\"\n" +
    "    ng-class=\"{ 'btn-primary': registerForm.$valid && registerForm.$dirty, 'btn-success': redirect }\"\n" +
    "    ng-disabled=\"registerForm.$invalid || registerForm.$pristine || xhr || redirect\">\n" +
    "    <span ng-hide=\"redirect\">Register <i class=\"fa fa-repeat fa-spin\" ng-show=\"xhr\"></i></span>\n" +
    "    <span ng-show=\"redirect\">Redirecting... <i class=\"fa fa-repeat fa-spin\"></i></span>\n" +
    "  </button>\n" +
    "</form>\n" +
    "");
}]);
