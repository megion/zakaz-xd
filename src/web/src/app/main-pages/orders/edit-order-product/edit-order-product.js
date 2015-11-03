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
                    OrdersResource.updateOrderProduct($scope.order._id, $scope.orderProduct).then(
                        function (response) {
                            InfoDialog.open("Продукт заказа изменен");
                            $state.go("edit-order", {id: $scope.order._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                }
            };

            $scope.delete = function() {
                YesNoDialog.open("Вы действительно хотите удалить товар из заказа?").then(
                    function() {
                        OrdersResource.removeOrderProduct($scope.order._id, $scope.orderProduct._id).then(
                            function (response) {
                                InfoDialog.open("Продукт заказа удален");
                                $state.go("edit-order", {id: $scope.order._id});
                            },
                            function (err) {
                                ErrorDialog.open(err.data);
                            }
                        );
                    }
                );
            };
        }
    ])
;
