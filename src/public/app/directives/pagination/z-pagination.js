angular.module('zakaz-xd.pagination', [
    'ui.bootstrap'
])
    .directive('zPagination', function () {
        return {
            restrict: 'E',
            scope: {
                /**
                 * config = {
                 *    itemsPerPage : 10,
                 *    page: 1,
                 *    total: 50,
                 *    pageChanged: function(page)  {
                 *    }
                 * }
                 */
                config: '=?',
                page: '=?'
            },
            templateUrl: 'app/directives/pagination/z-pagination.tpl.html',
            controller: function ($scope) {
                $scope.config.maxSize = $scope.config.maxSize || 5;
            }
        };
    })
;