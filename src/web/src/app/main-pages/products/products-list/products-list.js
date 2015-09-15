angular
    .module('zakaz-xd.products.products-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.directives.pagination',
        'zakaz-xd.resources.products-resource',
        'zakaz-xd.auth'
    ])
    .controller('ProductsListCtrl', ['$scope', '$stateParams', '$state', 'ProductsResource',
        'ErrorDialog', 'InfoDialog', 'user',
        function ($scope, $stateParams, $state, ProductsResource, ErrorDialog, InfoDialog, user) {
            $scope.user = user;

            $scope.productList = [];
            $scope.pageConfig = {
                page: 1,
                itemsPerPage: 10,
                pageChanged: function(page, itemsPerPage)  {
                    refreshProductsTable({page: page, itemsPerPage: itemsPerPage});
                }
            };

            function refreshProductsTable(page) {
                ProductsResource.getAllProducts(page).then(
                    function(response) {
                        $scope.productList = response.data.items;
                        $scope.pageConfig.count = response.data.count;
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            }

            refreshProductsTable({page: $scope.pageConfig.page, itemsPerPage: $scope.pageConfig.itemsPerPage});
        }
    ])
;
