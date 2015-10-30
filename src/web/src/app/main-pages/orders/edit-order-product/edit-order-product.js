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
    .controller('EditOrderProductCtrl', ['$scope', '$stateParams', '$state',
        'OrdersResource', 'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'order', 'orderProduct', 'userProducts',
        function ($scope, $stateParams, $state,
                  OrdersResource, ErrorDialog, InfoDialog, YesNoDialog, order, orderProduct, userProducts) {
            $scope.isCreate = !(orderProduct.product);
            $scope.orderProduct = orderProduct;
            $scope.order = order;

            console.log("order", order);


            $scope.products = [];
            angular.forEach(userProducts, function(value) {
                this.push(value.product);
            }, $scope.products);

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    OrdersResource.addOrderProduct($scope.order._id, $scope.orderProduct).then(
                        function (response) {
                            InfoDialog.open("Продукт добавлен в заказ");
                            $state.go("edit-order", {id: $scope.order._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                } else {
                    //OrdersResource.editUserProductPrice($scope.userProductPrice).then(
                    //    function (response) {
                    //        InfoDialog.open("Изменение цены для связи пользователь-товар успешно");
                    //        $state.go("edit-user-product", {userProductId: $scope.userProductPrice.userProduct._id});
                    //    },
                    //    function (err) {
                    //        ErrorDialog.open(err.data);
                    //    }
                    //);
                }
            };

            $scope.delete = function() {
                //YesNoDialog.open("Вы действительно хотите удалить цену на связь пользователь-товар?").then(
                //    function() {
                //        UserProductPricesResource.deleteUserProductPrice($scope.userProductPrice._id).then(
                //            function (response) {
                //                InfoDialog.open("Цена на связь пользователь-товар удалена");
                //                $state.go("edit-user-product", {userProductId: $scope.userProductPrice.userProduct._id});
                //            },
                //            function (err) {
                //                ErrorDialog.open(err.data, true);
                //            }
                //        );
                //    }
                //);
            };
        }
    ])
;
