angular.module('zakaz-xd.orders.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.dialogs',
    'zakaz-xd.resources.orders-resource',
    'zakaz-xd.resources.user-products-resource',
    'zakaz-xd.orders.orders-list',
    'zakaz-xd.orders.edit-order',
    'zakaz-xd.orders.edit-order-product'
])
    .config(['$stateProvider', '$urlRouterProvider', 'ACCESS',
        function ($stateProvider, $urlRouterProvider, ACCESS) {

            $stateProvider
                // заказы текущего пользователя
                .state('user-orders-list', {
                    url: '/user-orders-list',
                    controller: 'OrdersListCtrl',
                    templateUrl: 'app/main-pages/orders/orders-list/orders-list.tpl.html',
                    resolve: {
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.EDIT_OWN_ORDER);
                        }
                    }
                })
                // редактирование своего заказа
                .state('edit-user-order', {
                    url: '/user-order/edit/:id',
                    controller: 'EditOrderCtrl',
                    templateUrl: 'app/main-pages/orders/edit-order/edit-order.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.EDIT_OWN_ORDER);
                        },
                        order: function($stateParams, OrdersResource){
                            return OrdersResource.getUserOrderById($stateParams.id).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        allOrderStatuses: function($stateParams, OrdersResource){
                            return OrdersResource.getAllOrderStatuses().then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        }
                    }
                })
                // создание своего заказа
                .state('create-user-order', {
                    url: '/user-order/create',
                    controller: 'EditOrderCtrl',
                    templateUrl: 'app/main-pages/orders/edit-order/edit-order.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.EDIT_OWN_ORDER);
                        },
                        order: function() {
                            return {};
                        },
                        allOrderStatuses: function($stateParams, OrdersResource){
                            return OrdersResource.getAllOrderStatuses().then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        }

                    }
                })
                // добавление продукта к заказу
                .state('add-user-order-product', {
                    url: '/user-order/add-product/:orderId',
                    controller: 'EditOrderProductCtrl',
                    templateUrl: 'app/main-pages/orders/edit-order-product/edit-order-product.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.EDIT_OWN_ORDER);
                        },
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        isOrderManager: function ($stateParams, AuthService) {
                            return false;
                        },
                        order: function($stateParams, OrdersResource){
                            return OrdersResource.getUserOrderById($stateParams.orderId).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        orderProduct: function() {
                            return {};
                        },
                        userProducts: function($stateParams, UserProductsResource) {
                            return UserProductsResource.getProductUsersByCurrentUser().then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                })
                // изменение продукта заказа
                .state('edit-user-order-product', {
                    url: '/user-order/edit-product/:orderId/:productId',
                    controller: 'EditOrderProductCtrl',
                    templateUrl: 'app/main-pages/orders/edit-order-product/edit-order-product.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.EDIT_OWN_ORDER);
                        },
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        isOrderManager: function ($stateParams, AuthService) {
                            return false;
                        },
                        order: function($stateParams, OrdersResource){
                            return OrdersResource.getUserOrderById($stateParams.orderId).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        orderProduct: function($stateParams, order) {
                            if (!order.authorProducts) {
                                return null;
                            }
                            // найдем без запроса на сервер
                            for (var i=0; i<order.authorProducts.length; i++) {
                                var ap = order.authorProducts[i];
                                if (ap.product._id === $stateParams.productId) {
                                    return ap;
                                }
                            }
                            return null;
                        },
                        userProducts: function($stateParams, UserProductsResource) {
                            return UserProductsResource.getProductUsersByCurrentUser().then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                });

        }
    ]);
