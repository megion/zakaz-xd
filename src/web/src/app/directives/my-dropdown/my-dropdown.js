angular.module('zakaz-xd.directives.my-dropdown', [
    'ui.bootstrap'
])
    .directive('myDropdown', function () {
        return {
            restrict: 'E',
            scope: {
            },
            templateUrl: 'app/directives/my-dropdown/my-dropdown.tpl.html',
            controller: function ($scope) {

                $scope.open = function($event) {
                };
            }
        };
    });