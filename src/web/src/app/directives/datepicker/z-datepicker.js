angular.module('zakaz-xd.directives.datepicker', [
    'ui.bootstrap'
])
    .directive('zDatepicker', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                ngModel: '=',
                required: '=',
                name: '@'
            },
            templateUrl: 'app/directives/datepicker/z-datepicker.tpl.html',
            controller: function ($scope) {
                $scope.format = $scope.options.format || 'dd.MM.yyyy';

                $scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened = true;
                };
            }
        };
    })
;