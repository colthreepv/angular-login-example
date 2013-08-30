angular.module('templates-app', ['home/home.tpl.html']);

angular.module("home/home.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("home/home.tpl.html",
    "<div class=\"jumbotron\">\n" +
    "  <h1>This is home!</h1>\n" +
    "  <p>Everybody can access this page, for the following pages use:</p>\n" +
    "</div>\n" +
    "");
}]);
