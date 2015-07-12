/**
 * Изменение\создание продукта
 */
angular
    .module('zakaz-xd.products.edit-product', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.products-resource',
        'zakaz-xd.auth'
    ])
    .controller('EditProductCtrl', ['$scope', '$stateParams', '$state', 'ProductsResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'product', 'user', 'allMeasureUnits',
        function ($scope, $stateParams, $state, ProductsResource,
                  ErrorDialog, InfoDialog, YesNoDialog, product, user, allMeasureUnits) {
            $scope.isCreate = !(product._id);
            $scope.product = product;
            $scope.allMeasureUnits = allMeasureUnits;

            $scope.save = function(invalid) {
                console.log(invalid);
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    ProductsResource.createProduct($scope.product).then(
                        function (response) {
                            InfoDialog.open("Товар успешно создан");
                            $state.go("products-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                } else {
                    ProductsResource.editProduct($scope.product).then(
                        function (response) {
                            InfoDialog.open("Товар успешно изменен");
                            $state.go("products-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                }
            };

            $scope.deleteProduct = function() {
                YesNoDialog.open("Вы действительно хотите удалить продукт?").then(
                    function() {
                        ProductsResource.deleteProduct($scope.product._id).then(
                            function (response) {
                                InfoDialog.open("Продукт удален");
                                $state.go("products-list");
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };
        }
    ])
;
