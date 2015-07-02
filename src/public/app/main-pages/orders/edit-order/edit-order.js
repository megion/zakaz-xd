/**
 * Изменение\создание заказа
 */
angular
    .module('zakaz-xd.orders.edit-order', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.orders-resource',
        'zakaz-xd.auth'
    ])
    .controller('EditOrderCtrl', ['$scope', '$stateParams', '$state', 'OrdersResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'order',
        function ($scope, $stateParams, $state, OrdersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, order) {
            $scope.isCreate = !(order._id);
            $scope.order = order;

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    OrdersResource.createOrder($scope.order).then(
                        function (response) {
                            InfoDialog.open("Ваш заказ успешно создан");
                            $state.go("orders-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                } else {
                    OrdersResource.editOrder($scope.order).then(
                        function (response) {
                            InfoDialog.open("Ваш заказ успешно изменен");
                            $state.go("orders-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                }
            };

            $scope.deleteOrder = function() {
                YesNoDialog.open("Вы действительно хотите удалить заказ?").then(
                    function() {
                        OrdersResource.deleteOrder($scope.order._id).then(
                            function (response) {
                                InfoDialog.open("Заказ удален");
                                $state.go("orders-list");
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
