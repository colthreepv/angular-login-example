angular.module('templates-app', ['home/home.tpl.html', 'private/private.tpl.html']);

angular.module("home/home.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("home/home.tpl.html",
    "<div class=\"jumbotron\">\n" +
    "  <h1>This is home!</h1>\n" +
    "  <p>Everybody can access this page, for the following pages use:</p>\n" +
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
