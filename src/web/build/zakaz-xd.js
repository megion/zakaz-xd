/*
 * Version: 1.0 - 2015-09-21T15:51:38.633Z
 */


angular.module('zakaz-xd.main', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.dialogs',
    'zakaz-xd.auth.login-form',
    'zakaz-xd.user-profile',
    'zakaz-xd.orders.orders-list',
    'zakaz-xd.orders.edit-order',

    'zakaz-xd.orders.states',
    'zakaz-xd.products.states',
    'zakaz-xd.manage-users.states',
    'zakaz-xd.demo.states'
])
    .config(['$stateProvider', '$urlRouterProvider', 'ACCESS',
        function ($stateProvider, $urlRouterProvider, ACCESS) {

            $stateProvider
                .state('login', {
                    url: '/login',
                    controller: 'LoginFormCtrl',
                    templateUrl: 'app/main-pages/auth/login-form/login-form.tpl.html',
                    resolve: {
                        isAuthenticated: function ($q, AuthService) {
                            return AuthService.isAuthenticated();
                        },
                        canGo: function ($q, isAuthenticated) {
                            if (isAuthenticated) {
                                return $q.reject("User already login");
                            } else {
                                return $q.when(true);
                            }
                        }
                    }
                })
                .state('user-profile', {
                    url: '/profile',
                    controller: 'UserProfileCtrl',
                    templateUrl: 'app/main-pages/user-profile/user-profile.tpl.html',
                    resolve: {
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        }
                    }
                })
                .state('user-profile-change-password', {
                    url: '/profile/change-password',
                    controller: 'UserProfileCtrl',
                    templateUrl: 'app/main-pages/user-profile/user-profile-change-password.tpl.html',
                    resolve: {
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.CHANGE_OWN_PASSWORD);
                        }
                    }
                })
                .state('logout-success', {
                    url: "/logout-success",
                    templateUrl: 'app/main-pages/auth/logout-success/logout-success.tpl.html'
                })
                .state('access-denied', {
                    url: "/access-denied",
                    templateUrl: 'app/main-pages/auth/access-denied/access-denied.tpl.html'
                })
                .state('not-authenticated', {
                    url: "/not-authenticated",
                    templateUrl: 'app/main-pages/auth/not-authenticated/not-authenticated.tpl.html'
                });

            $urlRouterProvider.otherwise("/orders-list");
        }
    ])
    .controller('ZakazXdCtrl', ['$rootScope', '$scope', '$location', 'AuthService',
        function ($rootScope, $scope, $location, AuthService) {

        }
    ]).controller('ZakazXdHeaderCtrl', ['$rootScope', '$scope', '$state', 'AuthService', 'ErrorDialog',
        function ($rootScope, $scope, $state, AuthService, ErrorDialog) {
            $scope.logout = function() {
                AuthService.logout().then(
                    function(response) {
                        $state.go("logout-success");
                    },
                    function(err) {
                        ErrorDialog.open(err.data, true);
                    }
                );
            };

            // делаем запрос к серверу если еще не проверяли
            AuthService.isAuthenticated().then(
                function(isLogin) {
                    if (isLogin) {
                        AuthService.getCurrentUser();
                    }
                }
            );

            $scope.currentUser = function() {
                return AuthService.currentUser();
            };

            $scope.isLogin = function() {
                return AuthService.isLogin();
            };

            $scope.AuthService = AuthService;
        }
    ]);

angular
    .module('zakaz-xd.auth.access', [])

    .constant('ACCESS', {
        MANAGE_USERS: 1<<0, // 00001 Управление пользователями
        CREATE_ORDER: 1<<1, // 00010 Создание заказа
        VIEW_OWN_ORDERS: 1<<2, // 00100 Просмотр своих заказов
        EDIT_OWN_ORDER: 1<<3, // 01000 Редактирование своего заказа
        REMOVE_OWN_ORDER: 1<<4, // 10000 Удаление своего заказа
        VIEW_ALL_ORDER: 1<<5, // 100000 Просмотр всех заказов
        EDIT_ANY_ORDER: 1<<6, // Редактирование любого заказа
        REMOVE_ANY_ORDER: 1<<7, // Удаление любого заказа
        CHANGE_OWN_PASSWORD: 1<<8, // Изменение своего пароля
        CHANGE_OWN_ROLE_LIST: 1<<9, // Назначение себе ролей - не используется
        VIEW_ROLES: 1<<10, // Просмотр ролей (списка, детализация роли) - не используется,
        MANAGE_PRODUCTS: 1<<11, // Управление товарами создание и редактирование
        MANAGE_ORDERS: 1<<12 // Управление любыми заказами
    });
angular.module('zakaz-xd.auth', [
    'ngCookies',
    'zakaz-xd.auth.access',
    'zakaz-xd.resources.auth-resource',
    'zakaz-xd.dialogs'
])
    .run(['$rootScope', '$state', 'AuthService', 'ErrorDialog', function ($rootScope, $state, AuthService, ErrorDialog) {
        $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            event.preventDefault();

            if (error instanceof AccessError) {
                AuthService.accessDenied();
            } else {
                if (error.data) {
                    // ошибка сервера
                    ErrorDialog.open(error.data);
                } else {
                    // TODO: ошибка в клинтском javascript
                    //ErrorDialog.open(error, true);
                    console.error(error);
                }

            }
        });
    }])

    .factory('AuthInterceptor', ['$q', '$cookies', 'AuthService', function ($q, $cookies, AuthService) {
        return {
            responseError: function (response) {
                if (response.config && response.config.ignoreAuthInterceptor) {
                    return $q.reject(response);
                }

                if (response.status === 401) {
                    // user is not logged in
                    AuthService.notAuthenticated();
                }
                if (response.status === 403) {
                    // user is not allowed
                    AuthService.accessDenied();
                }

                return $q.reject(response);
            }
        };
    }])

    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    }])

    .provider('AuthService', function () {

        this.$get = ['$injector', '$q', 'ACCESS',
            function ($injector, $q, ACCESS) {

                var currentUser = null;
                var isLogin = null;
                /**
                 * данный promise необходим для того чтобы предотвартить создание
                 * несколько асинхронных запросов получения пользователя, которые могут быть созданы,
                 * если были попытки получить текущего пользователя до момента как первый из запросов отработает
                 */
                var currentUserPromise = null;

                /**
                 * Request current user from server
                 */
                function requestCurrentUser() {
                    if (currentUserPromise) {
                        return currentUserPromise;
                    }
                    var defer = $q.defer();
                    $injector.get('AuthResource').getCurrentUser().then(
                        function (response) {
                            currentUser = response.data;
                            defer.resolve(currentUser);
                            currentUserPromise = null;
                        },
                        function (err) {
                            defer.reject(err);
                            currentUserPromise = null;
                        }
                    );
                    currentUserPromise = defer.promise;
                    return currentUserPromise;
                }

                /**
                 * Request is authenticated
                 */
                function requestIsAuthenticated() {
                    var defer = $q.defer();
                    $injector.get('AuthResource').isAuthenticated().then(
                        function (response) {
                            isLogin = response.data;
                            defer.resolve(isLogin);
                        },
                        function (err) {
                            defer.reject(err);
                        }
                    );
                    return defer.promise;
                }

                /**
                 * Проверяет имеет ли пользователь указанную роль
                 */
                function isAuthorize(user, access) {
                    for (var i=0; i<user.roles.length; i++) {
                        var role = user.roles[i];
                        for (var j=0; j<role.accesses.length; j++) {
                            var userAccess = role.accesses[j].value;
                            if (access & userAccess) {
                                return true;
                            }
                        }
                    }
                    return false;
                }

                return {
                    /**
                     * return promise object
                     * @param access
                     */
                    checkAccess: function (access) {
                        if (currentUser) {
                            if(isAuthorize(currentUser, access)) {
                                return $q.when('Current user is allowed access ' + access);
                            } else {
                                return $q.reject(new AccessError('Current user is not allowed access ' + access));
                            }
                        } else {
                            var defer = $q.defer();
                            requestCurrentUser().then(
                                function (user) {
                                    if(isAuthorize(user, access)) {
                                        defer.resolve('Current user is allowed access ' + access);
                                    } else {
                                        defer.reject(new AccessError('Current user is not allowed access ' + access));
                                    }
                                },
                                function (err) {
                                    defer.reject(err);
                                }
                            );
                            return defer.promise;
                        }
                    },

                    /**
                     * Has current user specified access
                     * @param access
                     * @returns {*}
                     */
                    hasAccess: function(access) {
                        if (!currentUser) {
                            return false;
                        }

                        return isAuthorize(currentUser, access);
                    },

                    /**
                     * Has current user specified access
                     */
                    hasAccessByCodes: function(accessCodes) {
                        if (!currentUser) {
                            return false;
                        }

                        var accesses = accessCodes.split(",");
                        if(accesses.length===0) {
                            return true;
                        }

                        var accessValue = null;
                        for (var i=0; i<accesses.length; i++) {
                            var accKey= accesses[i];
                            var accVal = ACCESS[accKey];
                            if (accVal!==null && accVal!==undefined) {
                                if (accessValue) {
                                    accessValue = accessValue | accVal;
                                } else {
                                    accessValue = accVal;
                                }
                            }
                        }

                        if (accessValue === null) {
                            return false;
                        }
                        return isAuthorize(currentUser, accessValue);
                    },

                    /**
                     * user is not logged in
                     */
                    notAuthenticated: function() {
                        //$injector.get('$state').go('not-authenticated');
                        isLogin = false;
                        $injector.get('$state').go('login');
                    },

                    /**
                     * user is not allowed
                     */
                    accessDenied: function() {
                        $injector.get('$state').go('access-denied');
                    },

                    getCurrentUser: function() {
                        if (currentUser) {
                            return $q.when(currentUser);
                        } else {
                            return requestCurrentUser();
                        }
                    },

                    reloadCurrentUser: function() {
                        return requestCurrentUser();
                    },

                    currentUser: function() {
                        return currentUser;
                    },

                    isAuthenticated: function () {
                        if (isLogin!==null) {
                            return $q.when(isLogin);
                        } else {
                            return requestIsAuthenticated();
                        }
                    },

                    isLogin: function() {
                        return isLogin;
                    },

                    login: function (username, password) {
                        var defer = $q.defer();
                        $injector.get('AuthResource').login(username, password).then(
                            function(response) {
                                isLogin = true;
                                requestCurrentUser().then(
                                    function (user) {
                                        defer.resolve(user);
                                    },
                                    function (err) {
                                        defer.reject(err);
                                    }
                                );
                            },
                            function(err) {
                                defer.reject(err);
                            }
                        );

                        return defer.promise;
                    },

                    logout: function () {
                        var defer = $q.defer();
                        $injector.get('AuthResource').logout().then(
                            function (response) {
                                isLogin = null;
                                currentUser = null;
                                currentUserPromise = null;
                                defer.resolve(response);
                            },
                            function (err) {
                                defer.reject(err);
                            }
                        );
                        return defer.promise;
                    }
                };
            }

        ];
    });
angular.module('zakaz-xd.dialogs', [
    'ui.bootstrap'
])

    .factory('ErrorDialog', ['$q', '$modal', '$sce', function ($q, $modal) {
        return {
            open: function (error, printStack) {
                //$scope.errorMsg = $sce.trustAsHtml(err.data);
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    size: 'lg',
                    templateUrl: 'app/dialogs/error-dialog.tpl.html',
                    resolve: {
                    },
                    controller: function ($scope, $modalInstance) {
                        $scope.error = error;
                        $scope.printStack = printStack;
                        $scope.close = function () {
                            $modalInstance.close();
                        };
                    }
                });
            }
        };
    }])
    .factory('InfoDialog', ['$q', '$modal', '$sce', function ($q, $modal, $sce) {
        return {
            open: function (message, title) {
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    size: 'lg',
                    templateUrl: 'app/dialogs/info-dialog.tpl.html',
                    resolve: {
                    },
                    controller: function ($scope, $modalInstance) {
                        $scope.message = $sce.trustAsHtml(message);
                        $scope.title = title;
                        $scope.close = function () {
                            $modalInstance.close();
                        };
                    }
                });
            }
        };
    }])
    .factory('YesNoDialog', ['$q', '$modal', '$sce', function ($q, $modal, $sce) {
        return {
            open: function (message, title) {
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    size: 'lg',
                    templateUrl: 'app/dialogs/yes-no-dialog.tpl.html',
                    resolve: {
                    },
                    controller: function ($scope, $modalInstance) {
                        $scope.message = $sce.trustAsHtml(message);
                        $scope.title = title;
                        $scope.close = function () {
                            $scope.$dismiss("NO");
                        };
                        $scope.yes = function () {
                            $scope.$close("YES");
                        };
                        $scope.no = function () {
                            $scope.$dismiss("NO");
                        };
                    }
                });
                return modalInstance.result;
            }
        };
    }])
    .factory('ErrorHandler', ['ErrorDialog', function (ErrorDialog) {
        return {
            handle: function (err) {
                ErrorDialog.open(err.data, true);
            }
        };
    }]);
/**
 * Custom Error object for user access errors
 */
function AccessError() {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'AccessError';
    this.stack = temp.stack;
    this.message = temp.message;
}
//inherit prototype using ECMAScript 5 (IE 9+)
AccessError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: AccessError,
        writable: true,
        configurable: true
    }
});


angular.module('zakaz-xd.resources.auth-resource', [
])

    .factory('AuthResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/auth';
        return {
            changePassword: function (newPassword, repeatNewPassword) {
                return $http.post(startUrl + '/change-password',
                    {newPassword: newPassword, repeatNewPassword: repeatNewPassword});
            },
            saveUser: function (user) {
                return $http.post(startUrl + '/save-user', {user: user});
            },
            getCurrentUser: function () {
                return $http.get(startUrl + '/current-user', { headers: {'If-Modified-Since': '0'}});
            },
            login: function(username, password) {
                var config = {
                    ignoreAuthInterceptor: true
                };
                return $http.post(startUrl + '/login', {username: username, password: password}, config);
            },
            logout: function() {
                return $http.post(startUrl + '/logout', {});
            },
            isAuthenticated: function() {
                return $http.get(startUrl + '/is-authenticated');
            }
        };
    }]);
angular.module('zakaz-xd.resources.orders-resource', [
])

    .factory('OrdersResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/orders';
        return {
            createOrder: function (newOrder) {
                return $http.post(startUrl + '/create-order', {order: newOrder});
            },
            editOrder: function (order) {
                return $http.post(startUrl + '/edit-order', {order: order});
            },
            deleteOrder: function (orderId) {
                return $http.post(startUrl + '/delete-order', {orderId: orderId});
            },
            getAllOrders: function (page) {
                return $http.get(startUrl + '/all-orders', {params: page});
            },
            getAllUserOrders: function (page) {
                return $http.get(startUrl + '/user-orders', {params: page});
            },
            getOrderById: function (orderId) {
                return $http.get(startUrl + '/order-by-id', {params: {orderId: orderId}});
            },
            getUserOrderById: function (orderId) {
                return $http.get(startUrl + '/user-order-by-id', {params: {orderId: orderId}});
            },
            getAllOrderStatuses: function () {
                return $http.get(startUrl + '/all-order-statuses');
            }
        };
    }]);
angular.module('zakaz-xd.resources.products-resource', [
])

    .factory('ProductsResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/products';
        return {
            createProduct: function (newProduct) {
                return $http.post(startUrl + '/create-product', {product: newProduct});
            },
            editProduct: function (product) {
                return $http.post(startUrl + '/edit-product', {product: product});
            },
            deleteProduct: function (id) {
                return $http.post(startUrl + '/delete-product', {id: id});
            },
            getAllProducts: function (page) {
                return $http.get(startUrl + '/all-products', {params: page});
            },
            getProductById: function (id) {
                return $http.get(startUrl + '/product-by-id', {params: {id: id}});
            },
            getAllMeasureUnits: function () {
                return $http.get(startUrl + '/all-measure-units');
            },
            getAllProductTypes: function () {
                return $http.get(startUrl + '/all-product-types');
            }
        };
    }]);
angular.module('zakaz-xd.resources.roles-resource', [
])

    .factory('RolesResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/roles';
        return {
            getAllRoles: function () {
                return $http.get(startUrl + '/all-roles');
            }
        };
    }]);
angular.module('zakaz-xd.resources.user-product-prices-resource', [
])

    .factory('UserProductPricesResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/user-product-prices';
        return {
            getProductUserPricesByUserProductId: function (userProductId, page) {
                return $http.get(startUrl + '/user-product-prices-by-user-product-id', {params: {id: userProductId, page: page.page, itemsPerPage: page.itemsPerPage}});
            },
            createUserProductPrice: function (newUserProductPrice) {
                return $http.post(startUrl + '/create-user-product-price', {userProductPrice: newUserProductPrice});
            },
            deleteUserProductPrice: function (id) {
                return $http.post(startUrl + '/delete-user-product-price', {id: id});
            },
            editUserProductPrice: function (userProductPrice) {
                return $http.post(startUrl + '/edit-user-product-price', {userProductPrice: userProductPrice});
            },
            getUserProductPriceById: function (id) {
                return $http.get(startUrl + '/user-product-price-by-id', {params: {id: id}});
            }
        };
    }]);
angular.module('zakaz-xd.resources.user-products-resource', [
])

    .factory('UserProductsResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/user-products';
        return {
            getProductUsersByProductId: function (productId, page) {
                return $http.get(startUrl + '/product-users-by-product-id', {params: {id: productId, page: page.page, itemsPerPage: page.itemsPerPage}});
            },
            createUserProduct: function (newUserProduct) {
                return $http.post(startUrl + '/create-user-product', {userProduct: newUserProduct});
            },
            deleteUserProduct: function (id) {
                return $http.post(startUrl + '/delete-user-product', {id: id});
            },
            editUserProduct: function (userProduct) {
                return $http.post(startUrl + '/edit-user-product', {userProduct: userProduct});
            },
            getUserProductById: function (id) {
                return $http.get(startUrl + '/user-product-by-id', {params: {id: id}});
            }
        };
    }]);
angular.module('zakaz-xd.resources.users-resource', [
])

    .factory('UsersResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/users';
        return {
            createUser: function (newUser) {
                return $http.post(startUrl + '/create-user', {user: newUser});
            },
            editUser: function (user) {
                return $http.post(startUrl + '/edit-user', {user: user});
            },
            changePassword: function (passData) {
                return $http.post(startUrl + '/change-password', passData);
            },
            deleteUser: function (userId) {
                return $http.post(startUrl + '/delete-user', {userId: userId});
            },
            lockUser: function (userId) {
                return $http.post(startUrl + '/lock-user', {userId: userId});
            },
            unlockUser: function (userId) {
                return $http.post(startUrl + '/unlock-user', {userId: userId});
            },
            getAllUsers: function (page) {
                return $http.get(startUrl + '/all-users', {params: page});
            },
            getUserById: function (userId) {
                return $http.get(startUrl + '/user-by-id', {params: {userId: userId}});
            },

            // Delivery Point
            addUserDeliveryPoint: function (userId, deliveryPoint) {
                return $http.post(startUrl + '/add-user-delivery-point', {userId: userId, deliveryPoint: deliveryPoint});
            },
            updateUserDeliveryPoint: function (userId, deliveryPoint) {
                return $http.post(startUrl + '/update-user-delivery-point', {userId: userId, deliveryPoint: deliveryPoint});
            },
            removeUserDeliveryPoint: function (userId, deliveryPointId) {
                return $http.post(startUrl + '/remove-user-delivery-point', {userId: userId, deliveryPointId: deliveryPointId});
            },
            removeAllUserDeliveryPoints: function (userId) {
                return $http.post(startUrl + '/remove-all-user-delivery-points', {userId: userId});
            }

        };
    }]);
angular.module('zakaz-xd.directives.datepicker', [
    'ui.bootstrap'
])
    .directive('zDatepicker', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                ngModel: '=',
                required: '=',
                name: '@'
            },
            templateUrl: 'app/directives/datepicker/z-datepicker.tpl.html',
            controller: function ($scope) {
                $scope.format = $scope.options.format || 'dd.MM.yyyy';

                $scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened = true;
                };
            }
        };
    })
;
angular.module('zakaz-xd.directives.decimal', [
    'ui.bootstrap',
    'ngSanitize'
])
    .directive('lowercase', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attr, ngModel) {
                function fromUser(text) {
                    console.log('fromUser', text);
                    return (text || '').toUpperCase();
                }

                function toUser(text) {
                    console.log('toUser', text);
                    return (text || '').toLowerCase();
                }
                ngModel.$parsers.push(fromUser);
                ngModel.$formatters.push(toUser);
            }
        };
    })
;
angular.module('zakaz-xd.directives.pagination', [
    'ui.bootstrap'
])
    .directive('zPagination', function () {
        return {
            restrict: 'E',
            scope: {
                /**
                 * config = {
                 *    itemsPerPage : 10,
                 *    page: 1,
                 *    total: 50,
                 *    pageChanged: function(page)  {
                 *    }
                 * }
                 */
                config: '=?',
                page: '=?'
            },
            templateUrl: 'app/directives/pagination/z-pagination.tpl.html',
            controller: function ($scope) {
                $scope.config.maxSize = $scope.config.maxSize || 5;
            }
        };
    })
;
angular.module('zakaz-xd.demo.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.demo'
])
    .config(['$stateProvider', '$urlRouterProvider', 'ACCESS',
        function ($stateProvider, $urlRouterProvider, ACCESS) {

            $stateProvider
                .state('demo', {
                    url: '/demo',
                    controller: 'DemoCtrl',
                    templateUrl: 'app/main-pages/demo/demo.tpl.html',
                    resolve: {
                    }
                });
        }
    ]);

angular
    .module('zakaz-xd.demo', [
        'zakaz-xd.directives.decimal',
        'ui.select',
        'ngSanitize'
    ])
    .controller('DemoCtrl', ['$scope', '$stateParams', '$state',
        function ($scope, $stateParams, $state) {

            $scope.models = {
                lowercase1: 'testTEST'
            };


        }
    ])
;

angular.module('zakaz-xd.manage-users.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.dialogs',
    'zakaz-xd.resources.users-resource',
    'zakaz-xd.manage-users.users-list',
    'zakaz-xd.manage-users.edit-user',
    'zakaz-xd.manage-users.edit-user.change-password',
    'zakaz-xd.manage-users.edit-user.delivery-point'
])
    .config(['$stateProvider', '$urlRouterProvider', 'ACCESS',
        function ($stateProvider, $urlRouterProvider, ACCESS) {

            $stateProvider
                .state('users-list', {
                    url: '/manage-users/users-list',
                    controller: 'UsersListCtrl',
                    templateUrl: 'app/main-pages/manage-users/users-list/users-list.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_USERS);
                        }
                    }
                })
                .state('edit-user', {
                    url: '/manage-users/user/edit/:id',
                    controller: 'EditUserCtrl',
                    templateUrl: 'app/main-pages/manage-users/edit-user/edit-user.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_USERS);
                        },
                        user: function($stateParams, UsersResource){
                            return UsersResource.getUserById($stateParams.id).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        allRoles: function($stateParams, RolesResource, ErrorHandler){
                            return RolesResource.getAllRoles().then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                })
                .state('create-user', {
                    url: '/manage-users/user/create',
                    controller: 'EditUserCtrl',
                    templateUrl: 'app/main-pages/manage-users/edit-user/edit-user.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_USERS);
                        },
                        user: function() {
                            return {};
                        },
                        allRoles: function($stateParams, RolesResource, ErrorHandler){
                            return RolesResource.getAllRoles().then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                })
                .state('change-user-password', {
                    url: '/manage-users/user/change-password/:id',
                    controller: 'EditUserChangePasswordCtrl',
                    templateUrl: 'app/main-pages/manage-users/edit-user/change-password/edit-user-change-password.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_USERS);
                        },
                        user: function($stateParams, UsersResource, ErrorHandler){
                            return UsersResource.getUserById($stateParams.id).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                })
                .state('add-user-delivery-point', {
                    url: '/manage-users/user/add-user-delivery-point/:id',
                    controller: 'EditUserDeliveryPointCtrl',
                    templateUrl: 'app/main-pages/manage-users/edit-user/delivery-point/edit-user-delivery-point.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_USERS);
                        },
                        deliveryPoint: function() {
                            return {};
                        },
                        user: function($stateParams, UsersResource, ErrorHandler){
                            return UsersResource.getUserById($stateParams.id).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        }
                    }
                })
                .state('edit-user-delivery-point', {
                    url: '/manage-users/user/edit-user-delivery-point/:userId/:deliveryPointId',
                    controller: 'EditUserDeliveryPointCtrl',
                    templateUrl: 'app/main-pages/manage-users/edit-user/delivery-point/edit-user-delivery-point.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.MANAGE_USERS);
                        },
                        user: function($stateParams, UsersResource, ErrorHandler){
                            return UsersResource.getUserById($stateParams.userId).then(
                                function(response) {
                                    return response.data;
                                }
                            );
                        },
                        deliveryPoint: function($stateParams, user) {
                            // найдем точку достаки без запроса на сервер
                            for (var i=0; i<user.deliveryPoints.length; i++) {
                                var dp = user.deliveryPoints[i];
                                if (dp._id === $stateParams.deliveryPointId) {
                                    return dp;
                                }
                            }
                            return null;
                        }
                    }
                });
        }
    ]);

angular.module('zakaz-xd.orders.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.dialogs',
    'zakaz-xd.resources.orders-resource',
    'zakaz-xd.orders.orders-list',
    'zakaz-xd.orders.edit-order'
])
    .config(['$stateProvider', '$urlRouterProvider', 'ACCESS',
        function ($stateProvider, $urlRouterProvider, ACCESS) {

            $stateProvider
                // заказы текущего пользователя
                .state('orders-list', {
                    url: '/orders-list',
                    controller: 'OrdersListCtrl',
                    templateUrl: 'app/main-pages/orders/orders-list/orders-list.tpl.html',
                    resolve: {
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        },
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.VIEW_OWN_ORDERS);
                        }
                    }
                })
                // редактирование своего заказа
                .state('edit-order', {
                    url: '/order/edit/:id',
                    controller: 'EditOrderCtrl',
                    templateUrl: 'app/main-pages/orders/edit-order/edit-order.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.EDIT_OWN_ORDER);
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
                            return AuthService.checkAccess(ACCESS.CREATE_ORDER);
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
                });
        }
    ]);

angular.module('zakaz-xd.products.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.dialogs',
    'zakaz-xd.resources.products-resource',
    'zakaz-xd.products.products-list',
    'zakaz-xd.products.edit-product',
    'zakaz-xd.user-products.states'
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
                });
        }
    ]);

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

/**
 * Просмотр редактирование информации пользователя
 */
angular
    .module('zakaz-xd.user-profile', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.auth-resource',
        'zakaz-xd.auth'
    ])
    .controller('UserProfileCtrl', ['$scope', '$stateParams', '$state', '$http', 'user', 'AuthResource',
        'ErrorDialog', 'InfoDialog', 'AuthService',
        function ($scope, $stateParams, $state, $http, user, AuthResource,
                  ErrorDialog, InfoDialog, AuthService) {
            $scope.user = angular.copy(user);
            $scope.data = {
                newPassword: null,
                repeatNewPassword: null
            };
            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                AuthResource.saveUser($scope.user).then(
                    function (response) {
                        AuthService.reloadCurrentUser().then(
                            function(savedUser) {
                                $scope.user = angular.copy(savedUser);
                                InfoDialog.open('Успешное сохранение изменений', 'Сохранение изменений');
                            },
                            function (err) {
                                ErrorDialog.open(err, true);
                            }
                        );
                    },
                    function (err) {
                        ErrorDialog.open(err, true);
                    }
                );
            };
            $scope.changePassword  = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.data.newPassword !== $scope.data.repeatNewPassword) {
                    return ErrorDialog.open({message: 'Пароли не совпадают'});
                }

                AuthResource.changePassword($scope.data.newPassword, $scope.data.repeatNewPassword).then(
                    function (response) {
                        InfoDialog.open('Ваш пароль успешно <span style="color: blue;"> изменен <span>', 'Изменение пароля');
                    },
                    function (err) {
                        ErrorDialog.open(err, true);
                    }
                );
            };

        }
    ])
;

angular
    .module('zakaz-xd.auth.login-form', [
        'zakaz-xd.auth',
        'zakaz-xd.dialogs'
    ])
    .controller('LoginFormCtrl', ['$scope', '$stateParams', '$state', 'AuthService', 'ErrorDialog',
        function ($scope, $stateParams, $state, AuthService, ErrorDialog) {

            $scope.credentials = {
                username: null,
                password: null,
                rememberMe: null
            };
            $scope.login = function(invalid) {
                if (invalid) {
                    return false;
                }

                AuthService.login($scope.credentials.username, $scope.credentials.password).then(
                    function() {
                        $scope.errorMsg = null;
                        $state.go('orders-list');
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            };
        }
    ])
;

/**
 * Изменение\создание пользователя
 */
angular
    .module('zakaz-xd.manage-users.edit-user', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.resources.roles-resource',
        'zakaz-xd.auth'
    ])
    .controller('EditUserCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'user', 'allRoles',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, user, allRoles) {
            $scope.isCreate = !(user._id);
            $scope.allRoles = allRoles;
            $scope.user = user;
            if (!$scope.user.roles) {
                $scope.user.roles = [];
            }

            function setCheckedUserRoles(allRoles, user){
                if (!user.roles) {
                    return;
                }
                var allRolesMap = {};
                for (var i=0; i<allRoles.length; i++) {
                    var role = allRoles[i];
                    allRolesMap[role._id] = role;
                }
                for (var j=0; j<user.roles.length; j++) {
                    var userRole = user.roles[j];
                    if (allRolesMap[userRole._id]) {
                        allRolesMap[userRole._id].checked = true;
                    }
                }
            }
            setCheckedUserRoles(allRoles, user);

            function addCheckedRolesToUser(allRoles, user) {
                var newUserRoles = [];
                for (var j=0; j<allRoles.length; j++) {
                    var role = allRoles[j];
                    if (role.checked) {
                        newUserRoles.push(role);
                    }
                }
                // просто заменяем роли
                user.roles = newUserRoles;
            }

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                addCheckedRolesToUser($scope.allRoles, $scope.user);
                if ($scope.isCreate) {
                    UsersResource.createUser($scope.user).then(
                        function (response) {
                            InfoDialog.open("Пользователь успешно добавлен");
                            $state.go("users-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                } else {
                    UsersResource.editUser($scope.user).then(
                        function (response) {
                            InfoDialog.open("Пользователь успешно сохранен");
                            $state.go("users-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                }
            };

            $scope.lockUser = function() {
                YesNoDialog.open("Вы действительно хотите заблокировать пользователя?").then(
                    function() {
                        UsersResource.lockUser($scope.user._id).then(
                            function (response) {
                                InfoDialog.open("Пользователь заблокирован");
                                $state.go("edit-user", {id: $scope.user._id}, {reload: true});
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };
            $scope.unlockUser = function() {
                YesNoDialog.open("Вы действительно хотите разблокировать пользователя?").then(
                    function() {
                        UsersResource.unlockUser($scope.user._id).then(
                            function (response) {
                                InfoDialog.open("Пользователь разблокирован");
                                $state.go("edit-user", {id: $scope.user._id}, {reload: true});
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };
            $scope.deleteUser = function() {
                YesNoDialog.open("Вы действительно хотите удалить пользователя?").then(
                    function() {
                        UsersResource.deleteUser($scope.user._id).then(
                            function (response) {
                                InfoDialog.open("Пользователь удален");
                                $state.go("users-list");
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };

            $scope.removeAllUserDeliveryPoints = function() {
                YesNoDialog.open("Вы действительно хотите удалить все точки доставки пользователя?").then(
                    function() {
                        UsersResource.removeAllUserDeliveryPoints($scope.user._id).then(
                            function (response) {
                                InfoDialog.open("Все точки доствки пользователя удалены");
                                $state.reload();
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

/**
 * Список пользователей
 */
angular
    .module('zakaz-xd.manage-users.users-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.directives.pagination',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.auth'
    ])
    .controller('UsersListCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog) {

            $scope.userList = [];
            $scope.pageConfig = {
                page: 1,
                itemsPerPage: 10,
                pageChanged: function(page, itemsPerPage)  {
                    refreshUsersTable({page: page, itemsPerPage: itemsPerPage});
                }
            };

            function refreshUsersTable(page) {
                UsersResource.getAllUsers(page).then(
                    function(response) {
                        $scope.userList = response.data.items;
                        $scope.pageConfig.count = response.data.count;
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            }

            refreshUsersTable({page: $scope.pageConfig.page, itemsPerPage: $scope.pageConfig.itemsPerPage});
        }
    ])
;

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
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'order', 'user',
        function ($scope, $stateParams, $state, OrdersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, order, user) {
            $scope.isCreate = !(order._id);
            $scope.order = order;

            $scope.save = function(invalid) {
                console.log(invalid);
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

angular
    .module('zakaz-xd.orders.orders-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.directives.pagination',
        'zakaz-xd.resources.orders-resource',
        'zakaz-xd.auth'
    ])
    .controller('OrdersListCtrl', ['$scope', '$stateParams', '$state', 'OrdersResource',
        'ErrorDialog', 'InfoDialog', 'user',
        function ($scope, $stateParams, $state, OrdersResource, ErrorDialog, InfoDialog, user) {
            $scope.user = user;

            $scope.orderList = [];
            $scope.pageConfig = {
                page: 1,
                itemsPerPage: 10,
                pageChanged: function(page, itemsPerPage)  {
                    refreshOrdersTable({page: page, itemsPerPage: itemsPerPage});
                }
            };

            function refreshOrdersTable(page) {
                OrdersResource.getAllUserOrders(page).then(
                    function(response) {
                        $scope.orderList = response.data.items;
                        $scope.pageConfig.count = response.data.count;
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            }

            refreshOrdersTable({page: $scope.pageConfig.page, itemsPerPage: $scope.pageConfig.itemsPerPage});
        }
    ])
;

/**
 * Изменение\создание продукта
 */
angular
    .module('zakaz-xd.products.edit-product', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.products-resource',
        'zakaz-xd.auth',
        'ui.select',
        'ngSanitize'
    ])
    .controller('EditProductCtrl', ['$scope', '$stateParams', '$state', 'ProductsResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'product', 'user', 'allMeasureUnits', 'allProductTypes',
        function ($scope, $stateParams, $state, ProductsResource,
                  ErrorDialog, InfoDialog, YesNoDialog, product, user, allMeasureUnits, allProductTypes) {
            $scope.isCreate = !(product._id);
            $scope.product = product;
            $scope.allMeasureUnits = allMeasureUnits;
            $scope.allProductTypes = allProductTypes;

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    ProductsResource.createProduct($scope.product).then(
                        function (response) {
                            InfoDialog.open("Товар успешно создан");
                            $state.go("products-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                } else {
                    ProductsResource.editProduct($scope.product).then(
                        function (response) {
                            InfoDialog.open("Товар успешно изменен");
                            $state.go("products-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                }
            };

            $scope.deleteProduct = function() {
                YesNoDialog.open("Вы действительно хотите удалить продукт?").then(
                    function() {
                        ProductsResource.deleteProduct($scope.product._id).then(
                            function (response) {
                                InfoDialog.open("Продукт удален");
                                $state.go("products-list");
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

angular
    .module('zakaz-xd.products.products-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.directives.pagination',
        'zakaz-xd.resources.products-resource',
        'zakaz-xd.auth'
    ])
    .controller('ProductsListCtrl', ['$scope', '$stateParams', '$state', 'ProductsResource',
        'ErrorDialog', 'InfoDialog', 'user',
        function ($scope, $stateParams, $state, ProductsResource, ErrorDialog, InfoDialog, user) {
            $scope.user = user;

            $scope.productList = [];
            $scope.pageConfig = {
                page: 1,
                itemsPerPage: 10,
                pageChanged: function(page, itemsPerPage)  {
                    refreshProductsTable({page: page, itemsPerPage: itemsPerPage});
                }
            };

            function refreshProductsTable(page) {
                ProductsResource.getAllProducts(page).then(
                    function(response) {
                        $scope.productList = response.data.items;
                        $scope.pageConfig.count = response.data.count;
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            }

            refreshProductsTable({page: $scope.pageConfig.page, itemsPerPage: $scope.pageConfig.itemsPerPage});
        }
    ])
;

/**
 * Изменение\создание привязки пользователя к продукту
 */
angular
    .module('zakaz-xd.user-products.edit-user-product', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.user-products-resource',
        'zakaz-xd.resources.user-product-prices-resource',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.auth',
        'ui.select',
        'ngSanitize'
    ])
    .controller('EditUserProductCtrl', ['$scope', '$stateParams', '$state', 'UserProductsResource',
        'UsersResource', 'UserProductPricesResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'userProduct',
        function ($scope, $stateParams, $state, UserProductsResource,
                  UsersResource, UserProductPricesResource,
                  ErrorDialog, InfoDialog, YesNoDialog, userProduct) {
            $scope.isCreate = !(userProduct._id);
            $scope.userProduct = userProduct;

            UsersResource.getAllUsers().then(
                function(response) {
                    $scope.allUserList = response.data;
                },
                function(err) {
                    ErrorDialog.open(err.data);
                }
            );

            if (!$scope.isCreate) {
                $scope.userProductPrices = [];
                $scope.pageConfig = {
                    page: 1,
                    itemsPerPage: 5,
                    pageChanged: function(page, itemsPerPage)  {
                        refreshUserProductPricesTable({page: page, itemsPerPage: itemsPerPage});
                    }
                };

                refreshUserProductPricesTable({page: $scope.pageConfig.page, itemsPerPage: $scope.pageConfig.itemsPerPage});
            }

            function refreshUserProductPricesTable(page) {
                UserProductPricesResource.getProductUserPricesByUserProductId($scope.userProduct._id, page).then(
                    function(response) {
                        $scope.userProductPrices = response.data.items;
                        $scope.pageConfig.count = response.data.count;
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            }

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    UserProductsResource.createUserProduct($scope.userProduct).then(
                        function (response) {
                            InfoDialog.open("Связь товара с пользователем успешно создана");
                            $state.go("product-users-list", {id: $scope.userProduct.product._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                } else {
                    UserProductsResource.editUserProduct($scope.userProduct).then(
                        function (response) {
                            InfoDialog.open("Изменение связи товара с пользователем успешно");
                            $state.go("product-users-list", {id: $scope.userProduct.product._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                }
            };

            $scope.delete = function() {
                YesNoDialog.open("Вы действительно хотите удалить связь продукта и пользователя?").then(
                    function() {
                        UserProductsResource.deleteUserProduct($scope.userProduct._id).then(
                            function (response) {
                                InfoDialog.open("Связь с пользователем удалена");
                                $state.go("product-users-list", {id: $scope.userProduct.product._id});
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

                console.log("$scope.userProductPrice", $scope.userProductPrice);

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

angular
    .module('zakaz-xd.user-products.product-users-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.directives.pagination',
        'zakaz-xd.resources.user-products-resource',
        'zakaz-xd.auth'
    ])
    .controller('ProductUsersListCtrl', ['$scope', '$stateParams', '$state', 'UserProductsResource',
        'ErrorDialog', 'InfoDialog', 'product',
        function ($scope, $stateParams, $state, UserProductsResource, ErrorDialog, InfoDialog, product) {
            $scope.product = product;

            $scope.items = [];
            $scope.pageConfig = {
                page: 1,
                itemsPerPage: 10,
                pageChanged: function(page, itemsPerPage)  {
                    refreshTable({page: page, itemsPerPage: itemsPerPage});
                }
            };

            function refreshTable(page) {
                UserProductsResource.getProductUsersByProductId($scope.product._id, page).then(
                    function(response) {
                        $scope.items = response.data.items;
                        $scope.pageConfig.count = response.data.count;
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            }

            refreshTable({page: $scope.pageConfig.page, itemsPerPage: $scope.pageConfig.itemsPerPage});
        }
    ])
;

/**
 * Изменение\создание пользователя
 */
angular
    .module('zakaz-xd.manage-users.edit-user.change-password', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.resources.roles-resource',
        'zakaz-xd.auth'
    ])
    .controller('EditUserChangePasswordCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog', 'user',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog, user) {
            $scope.user = user;

            $scope.data = {
                newPassword: null,
                repeatNewPassword: null
            };

            $scope.changePassword  = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.data.newPassword !== $scope.data.repeatNewPassword) {
                    return ErrorDialog.open({message: 'Пароли не совпадают'});
                }

                var passData = {
                    userId: $scope.user._id,
                    newPassword: $scope.data.newPassword,
                    repeatNewPassword: $scope.data.repeatNewPassword
                };

                UsersResource.changePassword(passData).then(
                    function (response) {
                        InfoDialog.open('Пароль пользователя успешно изменен', 'Изменение пароля');
                        $state.go("users-list");
                    },
                    function (err) {
                        ErrorDialog.open(err, true);
                    }
                );
            };
        }
    ])
;

/**
 * Изменение\создание точки доставки пользователя
 */
angular
    .module('zakaz-xd.manage-users.edit-user.delivery-point', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.auth'
    ])
    .controller('EditUserDeliveryPointCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'user', 'deliveryPoint',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, user, deliveryPoint) {
            $scope.isCreate = !(deliveryPoint._id);
            $scope.user = user;
            $scope.deliveryPoint = deliveryPoint;

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    UsersResource.addUserDeliveryPoint($scope.user._id, $scope.deliveryPoint).then(
                        function (response) {
                            InfoDialog.open("Точка доставки добавлена");
                            $state.go("edit-user", {id: $scope.user._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                } else {
                    UsersResource.updateUserDeliveryPoint($scope.user._id, $scope.deliveryPoint).then(
                        function (response) {
                            InfoDialog.open("Изменение точки доставки успешно");
                            $state.go("edit-user", {id: $scope.user._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                }
            };

            $scope.delete = function() {
                YesNoDialog.open("Вы действительно хотите удалить точку доставки?").then(
                    function() {
                        UsersResource.removeUserDeliveryPoint($scope.user._id, $scope.deliveryPoint._id).then(
                            function (response) {
                                InfoDialog.open("Точка доставки удалена");
                                $state.go("edit-user", {id: $scope.user._id});
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