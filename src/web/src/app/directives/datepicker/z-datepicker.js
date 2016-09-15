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

                if ($scope.ngModel !== null && $scope.ngModel !== undefined) {
                    if (typeof $scope.ngModel === 'string') {
                        $scope.ngModel = new Date($scope.ngModel);
                    }
                }

                $scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened = true;
                };
            }
        };
    })
;