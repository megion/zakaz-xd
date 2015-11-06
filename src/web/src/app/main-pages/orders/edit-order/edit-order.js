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
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'order', 'user', 'AuthService',
        function ($scope, $stateParams, $state, OrdersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, order, user, AuthService) {
            $scope.AuthService = AuthService;
            $scope.isCreate = !(order._id);
            $scope.order = order;
            $scope.user = user;

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    OrdersResource.createOrder($scope.order).then(
                        function (response) {
                            InfoDialog.open("Ваш заказ успешно создан");
                            $state.go("user-orders-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                } else {
                    OrdersResource.editOrder($scope.order).then(
                        function (response) {
                            InfoDialog.open("Заказ успешно изменен");
                            $state.go("user-orders-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                }
            };

            $scope.removeAllOrderProducts = function() {
                YesNoDialog.open("Вы действительно хотите удалить все продукты у заказа?").then(
                    function() {
                        OrdersResource.removeAllOrderProducts($scope.order._id).then(
                            function (response) {
                                InfoDialog.open("Все продукты заказа удалены");
                                $state.reload();
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };

            $scope.deleteOrder = function() {
                YesNoDialog.open("Вы действительно хотите удалить заказ?").then(
                    function() {
                        OrdersResource.deleteOrder($scope.order._id).then(
                            function (response) {
                                InfoDialog.open("Заказ удален");
                                $state.go("user-orders-list");
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };

            $scope.activate = function() {
                YesNoDialog.open("Вы действительно хотите активировать заказ?").then(
                    function() {
                        OrdersResource.activateOrder($scope.order._id).then(
                            function (response) {
                                InfoDialog.open("Заказ активирован");
                                $state.go("user-orders-list");
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };
            $scope.approve = function() {
                YesNoDialog.open("Вы действительно хотите подтвердить заказ?").then(
                    function() {
                        OrdersResource.approveOrder($scope.order._id).then(
                            function (response) {
                                InfoDialog.open("Заказ подтвержден");
                                $state.go("user-orders-list");
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };
            $scope.ship = function() {
                YesNoDialog.open("Вы действительно хотите перевести заказ в отгруженные?").then(
                    function() {
                        OrdersResource.shipOrder($scope.order._id).then(
                            function (response) {
                                InfoDialog.open("Заказ переведен в отгруженные");
                                $state.go("user-orders-list");
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };
            $scope.close = function() {
                YesNoDialog.open("Вы действительно хотите закрыть заказ?").then(
                    function() {
                        OrdersResource.closeOrder($scope.order._id).then(
                            function (response) {
                                InfoDialog.open("Заказ закрыт");
                                $state.go("user-orders-list");
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
