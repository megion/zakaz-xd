angular.module('zakaz-xd.products.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.dialogs',
    'zakaz-xd.resources.products-resource',
    'zakaz-xd.products.products-list',
    'zakaz-xd.products.edit-product',
    'zakaz-xd.products.product-users-list',
    'zakaz-xd.products.edit-user-product'
])
    .config(['$stateProvider', '$urlRouterProvider', 'ACCESS',
        function ($stateProvider, $urlRouterProvider, ACCESS) {

            $stateProvider
                // список товаров
                .state('products-list', {
                    url: '/products-list',
                    controller: 'ProductsListCtrl',
                    templateUrl: 'app/main-pages/products/products-list/products-list.tpl.html',
                    resolve: {
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_PRODUCTS);
                        }
                    }
                })
                // редактирование товара
                .state('edit-product', {
                    url: '/product/edit/:id',
                    controller: 'EditProductCtrl',
                    templateUrl: 'app/main-pages/products/edit-product/edit-product.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_PRODUCTS);
                        },
                        product: function($stateParams, ProductsResource){
                            return ProductsResource.getProductById($stateParams.id).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        allMeasureUnits: function($stateParams, ProductsResource){
                            return ProductsResource.getAllMeasureUnits().then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        allProductTypes: function($stateParams, ProductsResource){
                            return ProductsResource.getAllProductTypes().then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                })
                // создание product
                .state('create-product', {
                    url: '/product/create',
                    controller: 'EditProductCtrl',
                    templateUrl: 'app/main-pages/products/edit-product/edit-product.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_PRODUCTS);
                        },
                        product: function() {
                            return {};
                        },
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        allMeasureUnits: function($stateParams, ProductsResource){
                            return ProductsResource.getAllMeasureUnits().then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        allProductTypes: function($stateParams, ProductsResource){
                            return ProductsResource.getAllProductTypes().then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                })
                // список пользователей указанного товара
                .state('product-users-list', {
                    url: '/product-users-list/:id',
                    controller: 'ProductUsersListCtrl',
                    templateUrl: 'app/main-pages/products/product-users-list/product-users-list.tpl.html',
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
                    templateUrl: 'app/main-pages/products/edit-user-product/edit-user-product.tpl.html',
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
                        userProduct: function(){
                            return {};
                        }
                    }
                })
                // редактирование user-product
                .state('edit-user-product', {
                    url: '/product/user-product/edit/:userProductId',
                    controller: 'EditUserProductCtrl',
                    templateUrl: 'app/main-pages/products/edit-user-product/edit-user-product.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_PRODUCTS);
                        },
                        userProduct: function($stateParams, ProductsResource){
                            return ProductsResource.getUserProductById($stateParams.userProductId).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        product: function($stateParams, ProductsResource, userProduct) {
                            return ProductsResource.getUserProductById(userProduct.product._id).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                });
        }
    ]);
