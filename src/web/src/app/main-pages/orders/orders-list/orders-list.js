angular
    .module('zakaz-xd.orders.orders-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.directives.pagination',
        'zakaz-xd.resources.orders-resource',
        'zakaz-xd.auth'
    ])
    .controller('OrdersListCtrl', ['$scope', '$stateParams', '$state', 'OrdersResource',
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
				deliveryDate: {
					start: null,
					end: null
				},
				createdDate: {
					start: null,
					end: null
				}
			};

            $scope.applySearch = function () {
                console.log("search", $scope.searchParameters);
				$scope.pageConfig.page = 1;
				refresh();
            };


            function refreshOrdersTable(page) {
                OrdersResource.getAllUserOrders(page, $scope.searchParameters).then(
                    function(response) {
                        $scope.orderList = response.data.items;
                        $scope.pageConfig.count = response.data.count;
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            }
			function refresh() {
				refreshOrdersTable({page: $scope.pageConfig.page, itemsPerPage: $scope.pageConfig.itemsPerPage});
			}

			refresh();
    
        }
    ])
;
