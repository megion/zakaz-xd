/**
 * Изменение\создание продукта
 */
angular
    .module('zakaz-xd.products.edit-product', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.products-resource',
        'zakaz-xd.auth',
        'ui.select',
        'ngSanitize'
    ])
    .controller('EditProductCtrl', ['$scope', '$stateParams', '$state', 'ProductsResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'product', 'user', 'allMeasureUnits', 'allProductTypes',
        function ($scope, $stateParams, $state, ProductsResource,
                  ErrorDialog, InfoDialog, YesNoDialog, product, user, allMeasureUnits, allProductTypes) {
            $scope.isCreate = !(product._id);
            $scope.product = product;
            $scope.allMeasureUnits = allMeasureUnits;
            $scope.allProductTypes = allProductTypes;

            $scope.save = function(invalid) {
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
                            ErrorDialog.open(err.data);
                        }
                    );
                } else {
                    ProductsResource.editProduct($scope.product).then(
                        function (response) {
                            InfoDialog.open("Товар успешно изменен");
                            $state.go("products-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
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
