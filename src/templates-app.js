angular.module('templates-app', ['error/error.tpl.html', 'home/home.tpl.html', 'private/private.tpl.html', 'register/register.tpl.html']);

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
    "  <p>Everybody can access this page, for the following pages use:</p>\n" +
    "  <p class=\"text-info\">username: johnm, password: hello, permission: user</p>\n" +
    "  <p class=\"text-danger\">username: sandrab, password: world, permission: admin</p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("private/private.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("private/private.tpl.html",
    "<div class=\"jumbotron\">\n" +
    "  <h1 class=\"text-danger\">This is your private data!</h1>\n" +
    "  <p>The passwords of your Chrome browser are...</p>\n" +
    "</div>\n" +
    "");
}]);

angular.module("register/register.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("register/register.tpl.html",
    "<form class=\"form-signin\" name=\"registerForm\" role=\"registration\">\n" +
    "  <h2 class=\"form-signin-heading\"><i class=\"icon-user\"></i> New User</h2>\n" +
    "  <!--div class=\"form-group\">\n" +
    "    <label for=\"username\" class=\"col-lg-2 control-label\">Email</label>\n" +
    "    <div class=\"col-lg-10\">\n" +
    "      <input type=\"text\" class=\"form-control\" id=\"username\" placeholder=\"Username\">\n" +
    "    </div>\n" +
    "  </div-->\n" +
    "  <div class=\"form-input username\">\n" +
    "    <input type=\"text\" class=\"form-control\" placeholder=\"Username\" name=\"username\" ng-model=\"registerObj.username\" autofocus=\"\" ng-minlength=\"4\" ng-maxlength=\"16\" ng-required=\"true\">\n" +
    "    <div class=\"errors\">\n" +
    "      <div class=\"error active\">\n" +
    "        <p class=\"text-danger\">Error: </p>\n" +
    "        <p>Some bad error haz happened TO YOU SIR!!111</p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <input type=\"password\" class=\"form-control password\" placeholder=\"Password\" name=\"password\" ng-model=\"registerObj.password\">\n" +
    "  <input type=\"password\" class=\"form-control password2\" placeholder=\"Repeat Password\" name=\"password2\" ng-model=\"registerObj.password2\">\n" +
    "  <input type=\"email\" class=\"form-control email\" placeholder=\"E-Mail\" name=\"email\" ng-model=\"registerObj.email\">\n" +
    "  <button class=\"btn btn-lg btn-primary btn-block\" type=\"submit\">Register</button>\n" +
    "</form>\n" +
    "");
}]);
