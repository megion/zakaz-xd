angular
    .module('zakaz-xd.user-products.product-users-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.directives.pagination',
        'zakaz-xd.resources.user-products-resource',
        'zakaz-xd.auth'
    ])
    .controller('ProductUsersListCtrl', ['$scope', '$stateParams', '$state', 'UserProductsResource',
        'ErrorDialog', 'InfoDialog', 'product',
        function ($scope, $stateParams, $state, UserProductsResource, ErrorDialog, InfoDialog, product) {
            $scope.product = product;

            $scope.items = [];
            $scope.pageConfig = {
                page: 1,
                itemsPerPage: 10,
                pageChanged: function(page, itemsPerPage)  {
                    refreshTable({page: page, itemsPerPage: itemsPerPage});
                }
            };

            function refreshTable(page) {
                UserProductsResource.getProductUsersByProductId($scope.product._id, page).then(
                    function(response) {
                        $scope.items = response.data.items;
                        $scope.pageConfig.count = response.data.count;
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            }

            refreshTable({page: $scope.pageConfig.page, itemsPerPage: $scope.pageConfig.itemsPerPage});
        }
    ])
;
