angular
    .module('zakaz-xd.orders.all-orders-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.directives.pagination',
        'zakaz-xd.directives.daterange',
        'zakaz-xd.resources.orders-resource',
        'zakaz-xd.auth'
    ])
    .controller('AllOrdersListCtrl', ['$scope', '$stateParams', '$state', 'OrdersResource',
        'ErrorDialog', 'InfoDialog', 'user',
        function ($scope, $stateParams, $state, OrdersResource, ErrorDialog, InfoDialog, user) {
            $scope.user = user;

            $scope.orderList = [];
            $scope.pageConfig = {
                page: 1,
                itemsPerPage: 10,
                pageChanged: function(page, itemsPerPage)  {
                    refreshOrdersTable({page: page, itemsPerPage: itemsPerPage});
                }
            };

            $scope.searchParameters = {
                dateStart: null,
                dateEnd: null
            };

            $scope.applySearch = function () {
                console.log("search", $scope.searchParameters );
            };

            function refreshOrdersTable(page) {
                OrdersResource.getAllOrders(page).then(
                    function(response) {
                        $scope.orderList = response.data.items;
                        $scope.pageConfig.count = response.data.count;
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            }

            refreshOrdersTable({page: $scope.pageConfig.page, itemsPerPage: $scope.pageConfig.itemsPerPage});
        }
    ])
;
