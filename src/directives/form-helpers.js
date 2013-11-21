angular.module('angular-login.directives', [])
/**
 * Simple directive to check password equality
 *
 * usage:
 * <input type="password" ng-model="password" password-match="password2">
 * <input type="password" ng-model="password2">
 */
.directive('passwordMatch', function () {
  return {
    restrict: 'A',
    scope: false,
    require: 'ngModel',
    link: function (scope, elem, attrs, controller) {
      var checker = function () {
        // get the value of the first password
        var pwd = scope.$eval(attrs.ngModel);
        // get the value of the other password
        var pwd2 = scope.$eval(attrs.passwordMatch);
        return pwd === pwd2;
      };
      scope.$watch(checker, function (pwdMatch) {
        controller.$setValidity('match', pwdMatch);
      });
    }
  };
})
/**
 * Directive to manage valid/invalid states of remote-validated Data.
 * It stores an internal array of values declared invalid by the server.
 * Generates the form error specified in case the user re-types the same invalid values,
 * clears the errors in case the user changes the ngModel.
 *
 * usage:
 * <input type="email" ng-model="email" remote-validated="used">
 *
 * NOTE: Your controllers have to make the field invalid in case *your* server says so.
 */
.directive('remoteValidated', function () {
  return {
    restrict: 'A',
    scope: false,
    require: 'ngModel',
    link: function (scope, elem, attrs, controller) {
      var invalidItems = [];
      scope.$watch(attrs.ngModel, function (newValue, oldValue) {
        if (newValue) {
          // Check the array of already-bad items
          if (invalidItems.indexOf(newValue) !== -1) {
            return controller.$setValidity(attrs.remoteValidated, false);
          }
          // When the model changes, it checks if the previous value was
          // triggering the error from server-side
          if (controller.$error[attrs.remoteValidated]) {
            invalidItems.push(oldValue);
          }
          controller.$setValidity(attrs.remoteValidated, true);
        }
      });
    }
  };
});
