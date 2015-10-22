/**
 * Изменение\создание привязки продукта к заказу
 */
angular
    .module('zakaz-xd.orders.edit-order-product', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.orders-resource',
        'zakaz-xd.auth',
        'ui.select',
        'ngSanitize'
    ])
    .controller('EditUserProductPriceCtrl', ['$scope', '$stateParams', '$state',
        'OrdersResource', 'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'orderProduct',
        function ($scope, $stateParams, $state,
                  OrdersResource, ErrorDialog, InfoDialog, YesNoDialog, orderProduct) {
            $scope.isCreate = !(orderProduct.product);
            $scope.orderProduct = orderProduct;

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    OrdersResource.createUserProductPrice($scope.userProductPrice).then(
                        function (response) {
                            InfoDialog.open("Цена на связь пользователь-торвар создана");
                            $state.go("edit-user-product", {userProductId: $scope.userProductPrice.userProduct._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                } else {
                    OrdersResource.editUserProductPrice($scope.userProductPrice).then(
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
