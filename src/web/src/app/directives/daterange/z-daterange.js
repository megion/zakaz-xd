angular.module('zakaz-xd.directives.daterange', [
    'ui.bootstrap'
])
    .directive('zDaterange', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                dateStart: '=',
                dateEnd: '=',
                required: '=',
                name: '@'
            },
            templateUrl: 'app/directives/daterange/z-daterange.tpl.html',
            controller: function ($scope) {
                if ($scope.dateStart !== null && $scope.dateStart !== undefined) {
                    if (typeof $scope.dateStart === 'string') {
                        $scope.dateStart = new Date($scope.dateStart);
                    }
                }

                if ($scope.dateEnd !== null && $scope.dateEnd !== undefined) {
                    if (typeof $scope.dateEnd === 'string') {
                        $scope.dateEnd = new Date($scope.dateEnd);
                    }
                }

            }
        };
    })
;