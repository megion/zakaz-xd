angular.module('zakaz-xd.orders.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.dialogs',
    'zakaz-xd.resources.orders-resource',
    'zakaz-xd.resources.users-resource',
    'zakaz-xd.resources.user-products-resource',
    'zakaz-xd.orders.orders-list',
    'zakaz-xd.orders.all-orders-list',
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
                // заказы текущего пользователя
                .state('all-orders', {
                    url: '/all-orders',
                    controller: 'AllOrdersListCtrl',
                    templateUrl: 'app/main-pages/orders/all-orders-list/all-orders-list.tpl.html',
                    resolve: {
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_ORDERS);
                        }
                    }
                })
                // редактирование заказа
                .state('edit-order', {
                    url: '/order/edit/:id',
                    controller: 'EditOrderCtrl',
                    templateUrl: 'app/main-pages/orders/edit-order/edit-order.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_ORDERS | ACCESS.EDIT_OWN_ORDER);
                        },
                        order: function($stateParams, OrdersResource){
                            return OrdersResource.getOrderById($stateParams.id).then(
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
                        },
                        author: function (user, order, UsersResource) {
                            if (user._id !== order.author._id) {
                                return UsersResource.getUserById(order.author._id).then(
                                    function(response) {
                                        return response.data;
                                    }
                                );
                            }
                            // ткущий пользователь
                            return user;
                        }

                    }
                })
                // создание своего заказа
                .state('create-order', {
                    url: '/order/create',
                    controller: 'EditOrderCtrl',
                    templateUrl: 'app/main-pages/orders/edit-order/edit-order.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_ORDERS | ACCESS.EDIT_OWN_ORDER);
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
                        },
                        author: function (user) {
                            // ткущий пользователь
                            return user;
                        }

                    }
                })
                // добавление продукта к заказу
                .state('add-order-product', {
                    url: '/order/add-product/:orderId',
                    controller: 'EditOrderProductCtrl',
                    templateUrl: 'app/main-pages/orders/edit-order-product/edit-order-product.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_ORDERS | ACCESS.EDIT_OWN_ORDER);
                        },
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        order: function($stateParams, OrdersResource){
                            return OrdersResource.getOrderById($stateParams.orderId).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        orderProduct: function() {
                            return {};
                        },
                        author: function (user, order, UsersResource) {
                            if (user._id !== order.author._id) {
                                return UsersResource.getUserById(order.author._id).then(
                                    function(response) {
                                        return response.data;
                                    }
                                );
                            }
                            // текущий пользователь
                            return user;
                        },
                        userProducts: function($stateParams, user, author, UserProductsResource) {
                            if (user._id !== author._id) {
                                return UserProductsResource.getProductUsersByUserId(author._id).then(
                                    function(response) {
                                        return response.data;
                                    }
                                );
                            } else {
                                return UserProductsResource.getProductUsersByCurrentUser().then(
                                    function(response) {
                                        return response.data;
                                    }
                                );
                            }
                        }
                    }
                })
                // изменение продукта заказа
                .state('edit-order-product', {
                    url: '/order/edit-product/:orderId/:orderProductId',
                    controller: 'EditOrderProductCtrl',
                    templateUrl: 'app/main-pages/orders/edit-order-product/edit-order-product.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_ORDERS | ACCESS.EDIT_OWN_ORDER);
                        },
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        order: function($stateParams, OrdersResource){
                            return OrdersResource.getOrderById($stateParams.orderId).then(
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
                                if (ap._id === $stateParams.orderProductId) {
                                    return ap;
                                }
                            }
                            return null;
                        },
                        author: function (user, order, UsersResource) {
                            if (user._id !== order.author._id) {
                                return UsersResource.getUserById(order.author._id).then(
                                    function(response) {
                                        return response.data;
                                    }
                                );
                            }
                            // текущий пользователь
                            return user;
                        },
                        userProducts: function($stateParams, user, author, UserProductsResource) {
                            if (user._id !== author._id) {
                                return UserProductsResource.getProductUsersByUserId(author._id).then(
                                    function(response) {
                                        return response.data;
                                    }
                                );
                            } else {
                                return UserProductsResource.getProductUsersByCurrentUser().then(
                                    function(response) {
                                        return response.data;
                                    }
                                );
                            }
                        }
                    }
                });

        }
    ]);
