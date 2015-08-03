/**
 * Изменение\создание привязки цены пользователя к продукту
 */
angular
    .module('zakaz-xd.user-product-prices.edit-user-product-price', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.user-products-resource',
        'zakaz-xd.resources.user-product-prices-resource',
        'zakaz-xd.directives.datepicker',
        'zakaz-xd.auth',
        'ui.select',
        'ngSanitize'
    ])
    .controller('EditUserProductPriceCtrl', ['$scope', '$stateParams', '$state',
        'UserProductsResource', 'UserProductPricesResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'userProductPrice',
        function ($scope, $stateParams, $state,
                  UserProductsResource, UserProductPricesResource,
                  ErrorDialog, InfoDialog, YesNoDialog, userProductPrice) {
            $scope.isCreate = !(userProductPrice._id);
            $scope.userProductPrice = userProductPrice;

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    UserProductPricesResource.createUserProductPrice($scope.userProductPrice).then(
                        function (response) {
                            InfoDialog.open("Цена на связь пользователь-торвар создана");
                            $state.go("edit-user-product", {userProductId: $scope.userProductPrice.userProduct._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                } else {
                    UserProductPricesResource.editUserProductPrice($scope.userProductPrice).then(
                        function (response) {
                            InfoDialog.open("Изменение цены для связи пользователь-товар успешно");
                            $state.go("edit-user-product", {userProductId: $scope.userProductPrice.userProduct._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                }
            };

            $scope.delete = function() {
                YesNoDialog.open("Вы действительно хотите удалить цену на связь пользователь-товар?").then(
                    function() {
                        UserProductPricesResource.deleteUserProductPrice($scope.userProductPrice._id).then(
                            function (response) {
                                InfoDialog.open("Цена на связь пользователь-товар удалена");
                                $state.go("edit-user-product", {userProductId: $scope.userProductPrice.userProduct._id});
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
