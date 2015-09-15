/*
 * Version: 1.0 - 2015-09-15T15:57:11.306Z
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

/**
 *
 */
(function (angular, _) {
    'use strict';
    var m,
        moduleNameHtml = 'lodash',
        moduleDependency = [
            /* none */
        ]
        ;
    m = angular.module(moduleNameHtml, moduleDependency);
    m.service('_', function () {
        return _;
    });

    if (_ === undefined) {
        console.log('WARN: Не подключена библиотека loDash.');
        return;
    }
    // Mixing in the object selectors
    // ------------------------------
    _.mixin({
        // Проинициализирует свойства object значениями одноименных свойств из source.
        // Если в source такое свойство не определено, то будет оставлено значение из object.
        fill: function fill(object, source) {
            if (_.isObject(source)) {
                _.each(object, function (value, key) {
                    if (source[key] !== undefined) {
                        object[key] = source[key];
                    }
                });
            }
            return object;
        }
    });

    _.mixin({
        pushAll: function (destArr, srcArr) {
            Array.prototype.push.apply(destArr, srcArr);
        },
        replaceArrayContent: function (dest, src) {
            if (!dest || !src) {
                return;
            }

            dest.length = 0;
            _.pushAll(dest, src);
        },
        clearArray: function (arr) {
            _.replaceArrayContent(arr, []);
        }
    });

    _.cleanEmpty = function (object) {
        return _.omit(object, function (value) {
            if (_.isObject(value) || _.isArray(value)) {
                value = _.cleanEmpty(value);
                return _.isEmpty(value);
            }
            return _.isUndefined(value) || _.isNull(value) || _.isNaN(value) || value === '';
        });
    };
}(angular, window._));


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

angular.module("zakaz-xd.main").run(["$templateCache", function($templateCache) {$templateCache.put("dialogs/error-dialog.tpl.html","<div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Закрыть\"><span aria-hidden=\"true\">&times;</span></button><h4 class=\"modal-title\">Ошибка</h4></div><div class=\"modal-body\"><div role=\"alert\" class=\"alert alert-danger\">{{error.message}}</div><pre data-ng-if=\"error.stack && printStack\">{{error.stack}}></pre></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"close()\">Закрыть</button></div>");
$templateCache.put("dialogs/info-dialog.tpl.html","<div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Закрыть\"><span aria-hidden=\"true\">&times;</span></button><h4 ng-if=\"title\" class=\"modal-title\">{{title}}</h4><h4 ng-if=\"!title\" class=\"modal-title\">Информация</h4></div><div class=\"modal-body\"><div role=\"alert\" class=\"alert alert-success\" ng-bind-html=\"message\"></div></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"close()\">Закрыть</button></div>");
$templateCache.put("dialogs/yes-no-dialog.tpl.html","<div class=\"modal-header\"><button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Закрыть\"><span aria-hidden=\"true\">&times;</span></button><h4 ng-if=\"title\" class=\"modal-title\">{{title}}</h4><h4 ng-if=\"!title\" class=\"modal-title\">Запрос на изменение</h4></div><div class=\"modal-body\"><p ng-bind-html=\"message\"></p></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" ng-click=\"yes()\">Да</button> <button class=\"btn btn-default\" ng-click=\"no()\">Нет</button></div>");
$templateCache.put("includes/footer.tpl.html","<div class=\"copyright\">© 2015 Заказы \"Хлебный Дом\"</div>");
$templateCache.put("includes/header.tpl.html","<div class=\"navbar-inner\"><button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".navbar-collapse\"><span class=\"sr-only\">Toggle Navigation</span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span></button><nav class=\"collapse navbar-collapse\" role=\"navigation\"><ul class=\"nav navbar-nav navbar-right\"><li ng-show=\"isLogin() && AuthService.hasAccessByCodes(\'VIEW_OWN_ORDERS\')\"><a data-ui-sref=\"orders-list\">Заказы</a></li><li data-ng-show=\"isLogin() && AuthService.hasAccessByCodes(\'MANAGE_USERS,MANAGE_ORDERS,MANAGE_PRODUCTS\')\" class=\"dropdown\"><a href=\"javascript:void(0)\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\">Администрирование <span class=\"caret\"></span></a><ul class=\"dropdown-menu\"><li ng-if=\"AuthService.hasAccessByCodes(\'MANAGE_USERS\')\"><a href=\"#/manage-users/users-list\">Управление пользователями</a></li><li ng-if=\"AuthService.hasAccessByCodes(\'MANAGE_PRODUCTS\')\"><a data-ui-sref=\"products-list\">Управление товарами</a></li><li ng-if=\"AuthService.hasAccessByCodes(\'MANAGE_ORDERS\')\"><a data-ui-sref=\"all-orders\">Управление заказами</a></li></ul></li><li ng-show=\"isLogin()\"><a href=\"#/profile\">{{currentUser().username}}</a></li><li ng-show=\"isLogin()\"><a data-ng-click=\"logout()\" href=\"javascript:void(0)\">Выйти</a></li><li ng-show=\"!isLogin()\"><a href=\"#/login\">Войти</a></li></ul></nav></div>");
$templateCache.put("directives/datepicker/z-datepicker.tpl.html","<p class=\"input-group\"><input type=\"text\" class=\"form-control\" datepicker-popup=\"{{format}}\" ng-model=\"ngModel\" name=\"name\" datepicker-options=\"options\" ng-required=\"required\" is-open=\"opened\" datepicker-append-to-body=\"true\" clear-text=\"Очистить\" close-text=\"Закрыть\" current-text=\"Сегодня\"> <span class=\"input-group-btn\"><button type=\"button\" class=\"btn btn-default\" ng-click=\"open($event)\"><i class=\"glyphicon glyphicon-calendar\"></i></button></span></p>");
$templateCache.put("directives/pagination/z-pagination.tpl.html","<pagination total-items=\"config.count\" ng-model=\"page\" max-size=\"config.maxSize\" items-per-page=\"config.itemsPerPage\" ng-change=\"config.pageChanged(page, config.itemsPerPage)\" class=\"pagination-sm\" boundary-links=\"true\" rotate=\"false\" previous-text=\"&lsaquo;\" next-text=\"&rsaquo;\" first-text=\"&laquo;\" last-text=\"&raquo;\"></pagination>");
$templateCache.put("main-pages/demo/demo.tpl.html","<h4>Demo</h4><form class=\"form-horizontal\" name=\"demoForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">lowercase</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"lowercase1\" data-ng-model=\"models.lowercase1\" lowercase=\"\"> {{models.lowercase1}}</div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div></div></form>");
$templateCache.put("main-pages/user-profile/user-profile-change-password.tpl.html","<h4>Изменение пароля пользователя</h4><form class=\"form-horizontal\" ng-submit=\"changePassword(changePasswordForm.$invalid)\" name=\"changePasswordForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Имя</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{user.username}}</p></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changePasswordForm.$submitted && changePasswordForm.newPassword.$error.required}\"><label for=\"inputPassword\" class=\"col-sm-2 control-label\">Новый пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"newPassword\" class=\"form-control\" id=\"inputPassword\" placeholder=\"Новый пароль\" data-ng-model=\"data.newPassword\" required=\"\"></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changePasswordForm.$submitted && changePasswordForm.repeatNewPassword.$error.required}\"><label for=\"inputPassword2\" class=\"col-sm-2 control-label\">Повторить новый пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"repeatNewPassword\" class=\"form-control\" id=\"inputPassword2\" placeholder=\"Повторить новый пароль\" data-ng-model=\"data.repeatNewPassword\" required=\"\"></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><button type=\"submit\" class=\"btn btn-primary\">Изменить пароль</button></div></div></form>");
$templateCache.put("main-pages/user-profile/user-profile.tpl.html","<h4>Профиль пользователя</h4><ul class=\"nav nav-pills\"><li role=\"presentation\"><a ui-sref=\"user-profile-change-password\">Сменить пароль</a></li></ul><form class=\"form-horizontal\" ng-submit=\"save(changeUserForm.$invalid)\" name=\"changeUserForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Имя</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{user.username}}</p></div></div><div class=\"form-group\" ng-class=\"{\'has-error\': changeUserForm.$submitted && changeUserForm.email.$error.pattern}\"><label for=\"email\" class=\"col-sm-2 control-label\">E-mail</label><div class=\"col-sm-10\"><input type=\"email\" class=\"form-control\" id=\"email\" name=\"email\" placeholder=\"E-mail\" data-ng-model=\"user.email\" data-ng-pattern=\"/^[a-z0-9!#$%&\'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\\.[a-z0-9-]+)*$/i\"></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div></div></form>");
$templateCache.put("main-pages/auth/access-denied/access-denied.tpl.html","<div role=\"alert\" class=\"alert alert-danger\">У вас нет доступа к ресурсу.</div>");
$templateCache.put("main-pages/auth/login-form/login-form.tpl.html","<form class=\"form-horizontal\" ng-submit=\"login(loginForm.$invalid)\" name=\"loginForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': loginForm.$submitted && loginForm.username.$error.required}\"><label for=\"inputUser3\" class=\"col-sm-2 control-label\">Имя</label><div class=\"col-sm-10\"><input type=\"text\" name=\"username\" class=\"form-control\" id=\"inputUser3\" placeholder=\"Имя пользователя\" data-ng-model=\"credentials.username\" required=\"\"> <span class=\"text-danger\" ng-show=\"loginForm.$submitted && loginForm.username.$error.required\">Поле обязательно для заполнения</span></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': loginForm.$submitted && loginForm.password.$error.required}\"><label for=\"inputPassword3\" class=\"col-sm-2 control-label\">Пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"password\" class=\"form-control\" id=\"inputPassword3\" placeholder=\"Пароль\" data-ng-model=\"credentials.password\" required=\"\"> <span class=\"text-danger\" ng-show=\"loginForm.$submitted && loginForm.password.$error.required\">Поле обязательно для заполнения</span></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><div class=\"checkbox\"><label><input type=\"checkbox\" data-ng-model=\"credentials.rememberMe\"> Запомнить меня</label></div></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><button type=\"submit\" class=\"btn btn-default\">Войти</button></div></div></form>");
$templateCache.put("main-pages/auth/logout-success/logout-success.tpl.html","<div role=\"alert\" class=\"alert alert-success\">Вы успешно вышли. <a ui-sref=\"login\">Войти</a></div>");
$templateCache.put("main-pages/auth/not-authenticated/not-authenticated.tpl.html","<div role=\"alert\" class=\"alert alert-danger\">Вы неавторизованы. <a ui-sref=\"login\">Войти</a></div>");
$templateCache.put("main-pages/manage-users/edit-user/edit-user.tpl.html","<h4 ng-if=\"isCreate\">Создание нового пользователя</h4><h4 ng-if=\"!isCreate\">Редактирование пользователя</h4><form class=\"form-horizontal\" ng-submit=\"save(changeUserForm.$invalid)\" name=\"changeUserForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': changeUserForm.$submitted && changeUserForm.username.$error.required}\"><label class=\"col-sm-2 control-label\">Имя</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"username\" placeholder=\"Имя пользователя\" data-ng-model=\"user.username\" required=\"\"></div></div><div class=\"form-group\" ng-class=\"{\'has-error\': changeUserForm.$submitted && changeUserForm.email.$error.pattern}\"><label for=\"email\" class=\"col-sm-2 control-label\">E-mail</label><div class=\"col-sm-10\"><input type=\"email\" class=\"form-control\" id=\"email\" name=\"email\" placeholder=\"E-mail\" data-ng-model=\"user.email\" data-ng-pattern=\"/^[a-z0-9!#$%&\'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\\.[a-z0-9-]+)*$/i\"></div></div><div class=\"form-group required\" ng-if=\"isCreate\" ng-class=\"{\'has-error\': changeUserForm.$submitted && changeUserForm.newPassword.$error.required}\"><label for=\"inputPassword\" class=\"col-sm-2 control-label\">Пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"newPassword\" class=\"form-control\" id=\"inputPassword\" placeholder=\"Пароль\" data-ng-model=\"user.password\" required=\"\"></div></div><div class=\"form-group required\" ng-if=\"isCreate\" ng-class=\"{\'has-error\': changeUserForm.$submitted && changeUserForm.repeatNewPassword.$error.required}\"><label for=\"inputPassword2\" class=\"col-sm-2 control-label\">Повторить пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"repeatNewPassword\" class=\"form-control\" id=\"inputPassword2\" placeholder=\"Повторить пароль\" data-ng-model=\"user.repeatPassword\" required=\"\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Роли</label><div class=\"col-sm-10\"><table class=\"table table-bordered\"><thead><tr><th>#</th><th>Роль</th></tr></thead><tbody><tr ng-repeat=\"role in allRoles\"><td><input type=\"checkbox\" ng-model=\"role.checked\"></td><td>{{role.title}}</td></tr></tbody></table></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Точки доставки</label><div class=\"col-sm-10\"><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table table-bordered\"><thead><tr><th>Наименование</th><th>Адрес</th></tr></thead><tbody><tr ng-repeat=\"deliveryPoint in user.deliveryPoints\"><td><a data-ui-sref=\"edit-user-delivery-point({userId: user._id, deliveryPointId: deliveryPoint._id})\">{{deliveryPoint.title}}</a></td><td>{{deliveryPoint.address}}</td></tr></tbody></table></div></div><div class=\"row\" ng-if=\"!isCreate\"><div class=\"col-sm-6\"><a data-ui-sref=\"add-user-delivery-point({id: user._id})\">Добавить точку доставки</a></div><div class=\"col-sm-6 text-right\"><button type=\"button\" data-ng-click=\"removeAllUserDeliveryPoints()\" class=\"btn btn-danger\">Удалить все точки доставки</button></div></div></div></div><div class=\"form-group\"><div class=\"col-sm-3\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button> <a ng-if=\"!isCreate\" data-ui-sref=\"change-user-password({id: user._id})\">Сменить пароль</a></div><div class=\"col-sm-9 text-right\" ng-if=\"!isCreate\"><button ng-if=\"!user.locked\" type=\"button\" data-ng-click=\"lockUser()\" class=\"btn btn-warning\">Заблокировать</button> <button ng-if=\"user.locked\" type=\"button\" data-ng-click=\"unlockUser()\" class=\"btn btn-warning\">Разблокировать</button> <button type=\"button\" data-ng-click=\"deleteUser()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("main-pages/manage-users/users-list/users-list.tpl.html","<div class=\"row\"><div class=\"col-sm-6\"><h4>Список пользователей</h4></div><div class=\"col-sm-6 text-right\"><a ui-sref=\"create-user\" class=\"btn btn-success\">Создать пользователя</a></div></div><div class=\"row\"><div class=\"col-sm-12\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div></div><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table\"><thead><tr><th>Имя пользователя</th><th>Email</th></tr></thead><tbody><tr data-ng-repeat=\"user in userList\"><td><a ui-sref=\"edit-user({id: user._id})\">{{user.username}}</a></td><td>{{user.email}}</td></tr></tbody></table></div></div>");
$templateCache.put("main-pages/orders/edit-order/edit-order.tpl.html","<h4 ng-if=\"isCreate\">Создание заказа</h4><h4 ng-if=\"!isCreate\">Редактирование заказа</h4><form class=\"form-horizontal\" ng-submit=\"save(changeOrderForm.$invalid)\" name=\"changeOrderForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': changeOrderForm.$submitted && changeOrderForm.title.$error.required}\"><label class=\"col-sm-2 control-label\">Наименование</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"title\" placeholder=\"Наименование заказа\" data-ng-model=\"order.title\" required=\"\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Текст</label><div class=\"col-sm-10\"><textarea class=\"form-control\" name=\"message\" placeholder=\"Текст заказа\" rows=\"6\" data-ng-model=\"order.message\">\r\n            </textarea></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><button type=\"button\" data-ng-click=\"deleteOrder()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("main-pages/orders/orders-list/orders-list.tpl.html","<div class=\"row\"><div class=\"col-sm-6\"><h4>Список заказов пользователя {{user.username}}</h4></div><div class=\"col-sm-6 text-right\"><a ui-sref=\"create-order\" class=\"btn btn-success\">Создать заказ</a></div></div><div class=\"row\"><div class=\"col-sm-12\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div></div><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table\"><thead><tr><th>Наименование</th><th>Дата создания</th></tr></thead><tbody><tr data-ng-repeat=\"order in orderList\"><td><a ui-sref=\"edit-order({id: order._id})\">{{order.title}}</a></td><td>{{order.createdDate}}</td></tr></tbody></table></div></div>");
$templateCache.put("main-pages/products/edit-product/edit-product.tpl.html","<h4 ng-if=\"isCreate\">Создание товара</h4><h4 ng-if=\"!isCreate\">Редактирование товара</h4><form class=\"form-horizontal\" ng-submit=\"save(changeProductForm.$invalid)\" name=\"changeProductForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': changeProductForm.$submitted && changeProductForm.title.$error.required}\"><label class=\"col-sm-2 control-label\">Наименование</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"title\" placeholder=\"Наименование\" data-ng-model=\"product.title\" required=\"\"></div></div><div class=\"form-group\" ng-if=\"!isCreate\"><label class=\"col-sm-2 control-label\">Дата создания</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{product.createdDate | date:\'dd.MM.yyyy HH:mm:ss\'}}</p></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeProductForm.$submitted && changeProductForm.measureUnit.$error.required}\"><label class=\"col-sm-2 control-label\">Единица измерения</label><div class=\"col-sm-10\"><ui-select ng-model=\"product.measureUnit\" theme=\"bootstrap\" name=\"measureUnit\" required=\"\"><ui-select-match placeholder=\"Единица измерения\" allow-clear=\"true\">{{$select.selected.title}}</ui-select-match><ui-select-choices repeat=\"item in allMeasureUnits | filter: $select.search\"><div ng-bind-html=\"item.title | highlight: $select.search\"></div></ui-select-choices></ui-select></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Тип</label><div class=\"col-sm-10\"><ui-select ng-model=\"product.type\" theme=\"bootstrap\" name=\"type\"><ui-select-match placeholder=\"Тип\" allow-clear=\"true\">{{$select.selected.title}}</ui-select-match><ui-select-choices repeat=\"item in allProductTypes | filter: $select.search\"><div ng-bind-html=\"item.title | highlight: $select.search\"></div></ui-select-choices></ui-select></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Кратность в упаковке</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"packageMultiplicity\" placeholder=\"Кратность в упаковке\" data-ng-model=\"product.packageMultiplicity\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Штрих код</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"barcode\" placeholder=\"Штрих код\" data-ng-model=\"product.barcode\"></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><a data-ui-sref=\"product-users-list({id: product._id})\">Список пользователей товара</a> <button type=\"button\" data-ng-click=\"deleteProduct()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("main-pages/products/products-list/products-list.tpl.html","<div class=\"row\"><div class=\"col-sm-6\"><h4>Список товаров</h4></div><div class=\"col-sm-6 text-right\"><a ui-sref=\"create-product\" class=\"btn btn-success\">Создать товар</a></div></div><div class=\"row\"><div class=\"col-sm-12\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div></div><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table\"><thead><tr><th>Наименование</th><th>Дата создания</th><th>Единица измерения</th><th>Тип</th></tr></thead><tbody><tr data-ng-repeat=\"product in productList\"><td><a ui-sref=\"edit-product({id: product._id})\">{{product.title}}</a></td><td>{{product.createdDate | date:\'dd.MM.yyyy HH:mm:ss\'}}</td><td>{{product.measureUnit.title}}</td><td>{{product.type.title}}</td></tr></tbody></table></div></div>");
$templateCache.put("main-pages/user-products/edit-user-product/edit-user-product.tpl.html","<h4 ng-if=\"isCreate\">Создание связи товара с пользователем</h4><h4 ng-if=\"!isCreate\">Редактирование связи товара с пользователем</h4><form class=\"form-horizontal\" ng-submit=\"save(changeForm.$invalid)\" name=\"changeForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Продукт</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{userProduct.product.title}}</p></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.user.$error.required}\"><label class=\"col-sm-2 control-label\">Пользователь</label><div class=\"col-sm-10\"><ui-select ng-model=\"userProduct.user\" theme=\"bootstrap\" name=\"user\" required=\"\"><ui-select-match placeholder=\"Пользователь\" allow-clear=\"true\">{{$select.selected.username}}</ui-select-match><ui-select-choices repeat=\"item in allUserList | filter: $select.search\"><div ng-bind-html=\"item.username | highlight: $select.search\"></div></ui-select-choices></ui-select></div></div><div class=\"form-group\" ng-if=\"!isCreate\"><label class=\"col-sm-2 control-label\">Цены</label><div class=\"col-sm-10\"><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table table-bordered\"><thead><tr><th>Дата</th><th>Цена</th></tr></thead><tbody><tr ng-repeat=\"userProductPrice in userProductPrices\"><td><a data-ui-sref=\"edit-user-product-price({userProductPriceId: userProductPrice._id})\">{{userProductPrice.priceDate | date:\'dd.MM.yyyy\'}}</a></td><td>{{userProductPrice.productPrice}}</td></tr></tbody></table></div></div><div class=\"row\"><div class=\"col-sm-8\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div><div class=\"col-sm-4\"><ul class=\"nav nav-pills pull-right\" ng-if=\"!isCreate\"><li><a data-ui-sref=\"add-user-product-price({userProductId: userProduct._id})\">Добавить цену</a></li></ul></div></div></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><button type=\"button\" data-ng-click=\"delete()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("main-pages/user-products/edit-user-product-price/edit-user-product-price.tpl.html","<h4 ng-if=\"isCreate\">Создание цены на связь товар-пользователь</h4><h4 ng-if=\"!isCreate\">Редактирование цены на связь товар-пользователь</h4><form class=\"form-horizontal\" ng-submit=\"save(changeForm.$invalid)\" name=\"changeForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Продукт</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{userProductPrice.userProduct.product.title}}</p></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Цена товара</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"productPrice\" placeholder=\"Цена товара\" data-ng-model=\"userProductPrice.productPrice\"></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.priceDate.$error.required}\"><label class=\"col-sm-2 control-label\">Дата действия</label><div class=\"col-sm-10\"><z-datepicker ng-model=\"userProductPrice.priceDate\" options=\"{}\" name=\"priceDate\" required=\"true\"></z-datepicker></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><button type=\"button\" data-ng-click=\"delete()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");
$templateCache.put("main-pages/user-products/product-users-list/product-users-list.tpl.html","<div class=\"row\"><div class=\"col-sm-6\"><h4>Список пользователей товара <a ui-sref=\"edit-product({id: product._id})\">{{product.title}}</a></h4></div><div class=\"col-sm-6 text-right\"><a ui-sref=\"create-user-product({productId: product._id})\" class=\"btn btn-success\">Добавить пользователя к товару</a></div></div><div class=\"row\"><div class=\"col-sm-12\"><z-pagination config=\"pageConfig\" page=\"pageConfig.page\"></z-pagination></div></div><div class=\"row\"><div class=\"col-sm-12\"><table class=\"table\"><thead><tr><th>Дата создания</th><th>Имя пользователя</th></tr></thead><tbody><tr data-ng-repeat=\"item in items\"><td><a ui-sref=\"edit-user-product({userProductId: item._id})\">{{item.createdDate | date:\'dd.MM.yyyy HH:mm:ss\'}}</a></td><td><a ui-sref=\"edit-user({id: item.user._id})\">{{item.user.username}}</a></td></tr></tbody></table></div></div>");
$templateCache.put("main-pages/manage-users/edit-user/change-password/edit-user-change-password.tpl.html","<h4>Изменение пароля пользователя</h4><form class=\"form-horizontal\" ng-submit=\"changePassword(changePasswordForm.$invalid)\" name=\"changePasswordForm\" novalidate=\"\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Имя</label><div class=\"col-sm-10\"><p class=\"form-control-static\">{{user.username}}</p></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changePasswordForm.$submitted && changePasswordForm.newPassword.$error.required}\"><label for=\"inputPassword\" class=\"col-sm-2 control-label\">Новый пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"newPassword\" class=\"form-control\" id=\"inputPassword\" placeholder=\"Новый пароль\" data-ng-model=\"data.newPassword\" required=\"\"></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changePasswordForm.$submitted && changePasswordForm.repeatNewPassword.$error.required}\"><label for=\"inputPassword2\" class=\"col-sm-2 control-label\">Повторить новый пароль</label><div class=\"col-sm-10\"><input type=\"password\" name=\"repeatNewPassword\" class=\"form-control\" id=\"inputPassword2\" placeholder=\"Повторить новый пароль\" data-ng-model=\"data.repeatNewPassword\" required=\"\"></div></div><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><button type=\"submit\" class=\"btn btn-primary\">Изменить пароль</button></div></div></form>");
$templateCache.put("main-pages/manage-users/edit-user/delivery-point/edit-user-delivery-point.tpl.html","<h4 ng-if=\"isCreate\">Добавление точки доставки</h4><h4 ng-if=\"!isCreate\">Редактирование точки доставки</h4><form class=\"form-horizontal\" ng-submit=\"save(changeForm.$invalid)\" name=\"changeForm\" novalidate=\"\"><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.title.$error.required}\"><label class=\"col-sm-2 control-label\">Наименование точки</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"title\" placeholder=\"Наименование точки доставки\" data-ng-model=\"deliveryPoint.title\" required=\"\"></div></div><div class=\"form-group required\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.address.$error.required}\"><label class=\"col-sm-2 control-label\">Адресс</label><div class=\"col-sm-10\"><input type=\"text\" class=\"form-control\" name=\"address\" placeholder=\"Адресс\" data-ng-model=\"deliveryPoint.address\" required=\"\"></div></div><div class=\"form-group\" ng-class=\"{\'has-error\': changeForm.$submitted && changeForm.email.$error.pattern}\"><label for=\"email\" class=\"col-sm-2 control-label\">E-mail</label><div class=\"col-sm-10\"><input type=\"email\" class=\"form-control\" id=\"email\" name=\"email\" placeholder=\"E-mail\" data-ng-model=\"deliveryPoint.email\" data-ng-pattern=\"/^[a-z0-9!#$%&\'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\\.[a-z0-9-]+)*$/i\"></div></div><div class=\"form-group\"><div class=\"col-sm-2\"><button type=\"submit\" class=\"btn btn-primary\">Сохранить</button></div><div class=\"col-sm-10 text-right\" ng-if=\"!isCreate\"><button type=\"button\" data-ng-click=\"delete()\" class=\"btn btn-danger\">Удалить</button></div></div></form>");}]);