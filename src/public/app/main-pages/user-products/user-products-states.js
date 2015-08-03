angular.module('zakaz-xd.user-products.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.dialogs',
    'zakaz-xd.resources.user-products-resource',
    'zakaz-xd.resources.user-product-prices-resource',
    'zakaz-xd.resources.products-resource',
    'zakaz-xd.user-products.product-users-list',
    'zakaz-xd.user-products.edit-user-product',
    'zakaz-xd.user-product-prices.edit-user-product-price'
])
    .config(['$stateProvider', '$urlRouterProvider', 'ACCESS',
        function ($stateProvider, $urlRouterProvider, ACCESS) {

            $stateProvider
                // список пользователей указанного товара
                .state('product-users-list', {
                    url: '/product-users-list/:id',
                    controller: 'ProductUsersListCtrl',
                    templateUrl: 'app/main-pages/user-products/product-users-list/product-users-list.tpl.html',
                    resolve: {
                        product: function($stateParams, ProductsResource){
                            return ProductsResource.getProductById($stateParams.id).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_PRODUCTS);
                        }
                    }
                })
                // создание user-product
                .state('create-user-product', {
                    url: '/product/user-product/create/:productId',
                    controller: 'EditUserProductCtrl',
                    templateUrl: 'app/main-pages/user-products/edit-user-product/edit-user-product.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_PRODUCTS);
                        },
                        product: function($stateParams, ProductsResource) {
                            return ProductsResource.getProductById($stateParams.productId).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        userProduct: function(product){
                            return {
                                product: product
                            };
                        }
                    }
                })
                // редактирование user-product
                .state('edit-user-product', {
                    url: '/product/user-product/edit/:userProductId',
                    controller: 'EditUserProductCtrl',
                    templateUrl: 'app/main-pages/user-products/edit-user-product/edit-user-product.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_PRODUCTS);
                        },
                        userProduct: function($stateParams, UserProductsResource){
                            return UserProductsResource.getUserProductById($stateParams.userProductId).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        product: function($stateParams, ProductsResource, userProduct) {
                            return ProductsResource.getProductById(userProduct.product._id).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                })
                // добавление цены на связь пользователь-товар
                .state('add-user-product-price', {
                    url: '/product/user-product/add-user-product-price/:userProductId',
                    controller: 'EditUserProductPriceCtrl',
                    templateUrl: 'app/main-pages/user-products/edit-user-product-price/edit-user-product-price.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_PRODUCTS);
                        },
                        userProductPrice: function($stateParams, UserProductsResource) {
                            return UserProductsResource.getUserProductById($stateParams.userProductId).then(
                                function(response) {
                                    return {userProduct: response.data};
                                }
                            );
                        }
                    }
                })
                // редактирование цены на связь пользователь-товар
                .state('edit-user-product-price', {
                    url: '/product/user-product/edit-user-product-price/:userProductPriceId',
                    controller: 'EditUserProductPriceCtrl',
                    templateUrl: 'app/main-pages/user-products/edit-user-product-price/edit-user-product-price.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_PRODUCTS);
                        },
                        userProductPrice: function($stateParams, UserProductPricesResource){
                            return UserProductPricesResource.getUserProductPriceById($stateParams.userProductPriceId).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                });
        }
    ]);
