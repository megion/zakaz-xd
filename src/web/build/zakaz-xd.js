/*
 * Version: 1.0 - 2016-12-01T20:56:33.710Z
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
    'zakaz-xd.user-profile.states',
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

            $urlRouterProvider.otherwise("/user-orders-list");
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
                        currentUser = null;
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
                        if ($scope.error.status && $scope.error.status === 400) {
                            // стек не печатем т.к. это ошибка валидации или логики
                            $scope.printStack = false;
                        }
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
                return $http.post(startUrl + '/delete-order', {id: orderId});
            },
			getAllOrders: function (page, req) {
                return $http.post(startUrl + '/all-orders', {page: page, req: req});
            },
            getAllUserOrders: function (page, req) {
                return $http.post(startUrl + '/user-orders', {page: page, req: req});
            },
            getOrderById: function (orderId) {
                return $http.get(startUrl + '/order-by-id', {params: {orderId: orderId}});
            },
            getAllOrderStatuses: function () {
                return $http.get(startUrl + '/all-order-statuses');
            },

            // order product
            addOrderProduct: function (orderId, orderProduct) {
                return $http.post(startUrl + '/add-order-product', {orderId: orderId, orderProduct: orderProduct});
            },
            updateOrderProduct: function (orderId, orderProduct) {
                return $http.post(startUrl + '/update-order-product', {orderId: orderId, orderProduct: orderProduct});
            },
            removeOrderProduct: function (orderId, orderProductId) {
                return $http.post(startUrl + '/remove-order-product', {orderId: orderId, orderProductId: orderProductId});
            },
            removeAllOrderProducts: function (orderId) {
                return $http.post(startUrl + '/remove-all-order-products', {orderId: orderId});
            },

            // change statuses
            activateOrder: function (orderId) {
                return $http.post(startUrl + '/activate-order', {orderId: orderId});
            },
            approveOrder: function (orderId) {
                return $http.post(startUrl + '/approve-order', {orderId: orderId});
            },
            shipOrder: function (orderId) {
                return $http.post(startUrl + '/ship-order', {orderId: orderId});
            },
            closeOrder: function (orderId) {
                return $http.post(startUrl + '/close-order', {orderId: orderId});
            },

            // comment
            addOrderComment: function (orderId, comment) {
                return $http.post(startUrl + '/add-order-comment', {orderId: orderId, comment: comment});
            },
            updateOrderComment: function (orderId, comment) {
                return $http.post(startUrl + '/update-order-comment', {orderId: orderId, comment: comment});
            },
            removeOrderComment: function (orderId, orderCommentId) {
                return $http.post(startUrl + '/remove-order-comment', {orderId: orderId, orderCommentId: orderCommentId});
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
            getProductUsersByCurrentUser: function () {
                return $http.get(startUrl + '/product-users-by-current-user', {params: {}});
            },
            getProductUsersByUserId: function (userId) {
                return $http.get(startUrl + '/product-users-by-user-id', {params: {userId: userId}});
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
            },

            // current user delivery point
            addCurrentUserDeliveryPoint: function (deliveryPoint) {
                return $http.post(startUrl + '/add-current-user-delivery-point', {deliveryPoint: deliveryPoint});
            },
            updateCurrentUserDeliveryPoint: function (deliveryPoint) {
                return $http.post(startUrl + '/update-current-user-delivery-point', {deliveryPoint: deliveryPoint});
            },
            removeCurrentUserDeliveryPoint: function (deliveryPointId) {
                return $http.post(startUrl + '/remove-current-user-delivery-point', {deliveryPointId: deliveryPointId});
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

                if ($scope.ngModel !== null && $scope.ngModel !== undefined) {
                    if (typeof $scope.ngModel === 'string') {
                        $scope.ngModel = new Date($scope.ngModel);
                    }
                }

                $scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened = true;
                };
            }
        };
    })
;
angular.module('zakaz-xd.directives.daterange', [
    'ui.bootstrap'
])
    .directive('zDaterange', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                dateStart: '=',
                dateEnd: '=',
                required: '=',
                name: '@'
            },
            templateUrl: 'app/directives/daterange/z-daterange.tpl.html',
            controller: function ($scope) {
                if ($scope.dateStart !== null && $scope.dateStart !== undefined) {
                    if (typeof $scope.dateStart === 'string') {
                        $scope.dateStart = new Date($scope.dateStart);
                    }
                }

                if ($scope.dateEnd !== null && $scope.dateEnd !== undefined) {
                    if (typeof $scope.dateEnd === 'string') {
                        $scope.dateEnd = new Date($scope.dateEnd);
                    }
                }

            }
        };
    })
;
angular.module('zakaz-xd.directives.decimal', [
    'ui.bootstrap',
    'ngSanitize'
])
    .directive('lowercase', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                function fromUser(text) {
                    console.log('fromUser', text);
                    return (text || '').toUpperCase();
                }

                function toUser(text) {
                    console.log('toUser', text);
                    return (text || '').toLowerCase();
                }

                //ngModel.$parsers.push(fromUser);
                //ngModel.$formatters.push(toUser);

                function formatter(value) {
                    console.log('formatter', value);
                    if (value) {
                        return value.toUpperCase();
                    }
                }

                ngModel.$formatters.push(formatter);
            }
        };
    })
    .directive('banEnterZero', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                function banZero(value) {
                    if (!scope.prevAppliedValue) {
                        scope.prevAppliedValue = value;
                        return value;
                    }

                    var oldValue = scope.prevAppliedValue;

                    // новое значение не пустое и старое значение не пустое
                    if (value!==null && value!==undefined && oldValue!==null && oldValue!==undefined) {
                        var numValue = parseFloat(value);
                        // проверить новое значение: если оно не пустое и является числом при этом = 0 то установить
                        // старое значение.
                        if (numValue!=null && numValue===0) {
                            // дополнительная проверка: если старое значение было 0, тогда можно ввести любое значение
                            var numOldValue = parseFloat(oldValue);
                            if (!(numOldValue != null && numOldValue===0)) {
                                ngModel.$setViewValue(oldValue);
                                ngModel.$render();
                                return oldValue;
                            }
                        }
                    }

                    scope.prevAppliedValue = value;
                    return value;
                }
                function formatter(value) {
                    scope.prevAppliedValue = value;
                    return value;
                }

                ngModel.$formatters.push(formatter);
                ngModel.$parsers.push(banZero);
            }
        };
    })
;
angular.module('zakaz-xd.directives.my-dropdown', [
    'ui.bootstrap'
])
    .directive('myDropdown', function () {
        return {
            restrict: 'E',
            scope: {
            },
            templateUrl: 'app/directives/my-dropdown/my-dropdown.tpl.html',
            controller: function ($scope) {

                $scope.open = function($event) {
                };
            }
        };
    });
angular.module('common.hcs-dropdown2',
    ['ui.bootstrap.position'])

    .service('hcsDropdown2Utils', ['$document', '$window', function($document, $window) {
        var BODY_SCROLLBAR_WIDTH;
        this.getBodyScrollbarWidth = function() {
            if (!BODY_SCROLLBAR_WIDTH) {
                var bodyElem = $document.find('body');
                bodyElem.addClass('uib-position-body-scrollbar-measure');
                BODY_SCROLLBAR_WIDTH = $window.innerWidth - bodyElem[0].clientWidth;
                BODY_SCROLLBAR_WIDTH = isFinite(BODY_SCROLLBAR_WIDTH) ? BODY_SCROLLBAR_WIDTH : 0;
                bodyElem.removeClass('uib-position-body-scrollbar-measure');
            }
            return BODY_SCROLLBAR_WIDTH;
        };
    }])
    .controller('hcsDropdown2Ctrl', [
        '$scope', '$element', '$attrs', '$parse', 'dropdownService', '$animate',
        '$position', '$document', 'hcsDropdown2Utils', '$timeout',
        function ($scope, $element, $attrs, $parse, dropdownService, $animate,
                  $position, $document, hcsDropdown2Utils, $timeout) {
            var self = this,
                scope = $scope.$new(), // create a child scope so we are not polluting original one
                getIsOpen,
                setIsOpen = angular.noop,
                toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
                appendTo = $document.find('body');

            this.init = function () {
                if ($attrs.isOpen) {
                    getIsOpen = $parse($attrs.isOpen);
                    setIsOpen = getIsOpen.assign;

                    $scope.$watch(getIsOpen, function (value) {
                        scope.isOpen = !!value;
                    });
                }

                if (self.dropdownMenu) {
                    appendTo.append(self.dropdownMenu);
                    $element.on('$destroy', function handleDestroyEvent() {
                        self.dropdownMenu.remove();
                    });
                }
            };

            this.toggle = function (open) {
                scope.isOpen = arguments.length ? !!open : !scope.isOpen;
                if (angular.isFunction(setIsOpen)) {
                    setIsOpen(scope, scope.isOpen);
                }

                return scope.isOpen;
            };

            // Allow other directives to watch status
            this.isOpen = function () {
                return scope.isOpen;
            };

            scope.getToggleElement = function () {
                return self.toggleElement;
            };

            scope.getAutoClose = function () {
                return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
            };

            scope.getDropdownElement = function () {
                return self.dropdownMenu;
            };

            scope.focusToggleElement = function () {
                if (self.toggleElement) {
                    self.toggleElement[0].focus();
                }
            };

            function updatePosition(_isOpen, isAsync) {
                function refresh() {
                    var pos = $position.positionElements($element, self.dropdownMenu, 'bottom-left', true);
                    var css = {
                        top: pos.top + 'px',
                        display: _isOpen ? 'block' : 'none'
                    };

                    var rightalign = self.dropdownMenu.hasClass('dropdown-menu-right');
                    if (!rightalign) {
                        css.left = pos.left + 'px';
                        css.right = 'auto';
                    } else {
                        css.left = 'auto';

                        var scrollParent = $document[0].documentElement;
                        var scrollbarWidth = hcsDropdown2Utils.getBodyScrollbarWidth();
                        var heightOverflow = scrollParent.scrollHeight > scrollParent.clientHeight;
                        if (!(heightOverflow && scrollbarWidth)) {
                            scrollbarWidth = 0;
                        }
                        css.right = window.innerWidth - scrollbarWidth - (pos.left + $element.prop('offsetWidth')) + 'px';
                    }
                    self.dropdownMenu.css(css);
                }

                if (self.dropdownMenu) {
                    if (isAsync) {
                        refresh();
                        $timeout(refresh);
                    } else {
                        refresh();
                    }
                }
            }

            $(window).on('resize.hcsDropdown2', function () {
                scope.$apply(function() {
                    // if window have been resized then close
                    if (scope.isOpen) {
                        scope.isOpen = false;
                    }
                    //updatePosition(scope.isOpen, false);
                });
            });

            scope.$on('$destroy',function () {
                $(window).off('resize.hcsDropdown2');
            });

            scope.$watch('isOpen', function (isOpen, wasOpen) {
                updatePosition(isOpen, true);
                if (isOpen) {
                    scope.focusToggleElement();
                    dropdownService.open(scope);
                } else {
                    dropdownService.close(scope);
                }

                if (angular.isFunction(setIsOpen)) {
                    setIsOpen($scope, isOpen);
                }

                if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
                    toggleInvoker($scope, {open: !!isOpen});
                }
            });
        }])

    .directive('hcsDropdown2', function () {
        return {
            controller: 'hcsDropdown2Ctrl',
            link: function (scope, element, attrs, dropdownCtrl) {
                dropdownCtrl.init();
            }
        };
    })

    .directive('hcsDropdown2Menu', function () {
        return {
            restrict: 'A',
            require: '?^hcsDropdown2',
            link: function (scope, element, attrs, dropdownCtrl) {
                if (!dropdownCtrl) {
                    return;
                }

                if (!dropdownCtrl.dropdownMenu) {
                    dropdownCtrl.dropdownMenu = element;
                }
            }
        };
    })

    .directive('hcsDropdown2Toggle', function () {
        return {
            require: '?^hcsDropdown2',
            link: function (scope, element, attrs, dropdownCtrl) {
                if (!dropdownCtrl) {
                    return;
                }

                dropdownCtrl.toggleElement = element;

                function toggleDropdown(event) {
                    event.preventDefault();
                    if (!element.hasClass('disabled') && !attrs.disabled) {
                        scope.$apply(function () {
                            dropdownCtrl.toggle();
                        });
                    }
                }

                element.on('click.hcsDropdown2', toggleDropdown);

                // WAI-ARIA
                element.attr({'aria-haspopup': true, 'aria-expanded': false});
                scope.$watch(dropdownCtrl.isOpen, function (isOpen) {
                    element.attr('aria-expanded', !!isOpen);
                });

                scope.$on('$destroy', function () {
                    element.off('click.hcsDropdown2', toggleDropdown);
                });
            }
        };
    });

/*
 Copied from https://github.com/asadighi/ui-utils/blob/master/modules/mask/mask.js
 commit 4615f8e2449d95badf280a9820b8e6429ebb99ab
 This commit is fix for https://github.com/angular-ui/ui-utils/issues/317

 Новая директива hcsUiMask сделана для замены uiMask (https://github.com/angular-ui/ui-utils/tree/v1.0.0) из ui-utils

 В следствии того что фикс https://github.com/angular-ui/ui-utils/issues/317 был сделан в новой версии библиотеки
 https://github.com/angular-ui/ui-mask которая была вынесена из ui-utils.
 Поэтому самое простое решение это сделать новую директиву hcsUiMask с исправлением
 для https://jira.lanit.ru/browse/HCS-19442

 Attaches input mask onto input element
 */
angular.module('zakaz-xd.directives.my.ui.mask', [])
    .value('myUiMaskConfig', {
        'maskDefinitions': {
            '9': /\d/,
            'A': /[a-zA-Z]/,
            '*': /[a-zA-Z0-9]/
        },
        'clearOnBlur': true
    })
    .directive('myUiMask', ['myUiMaskConfig', '$parse', function (maskConfig, $parse) {
        'use strict';

        return {
            priority: 100,
            require: 'ngModel',
            restrict: 'A',
            compile: function uiMaskCompilingFunction(){
                var options = maskConfig;

                return function uiMaskLinkingFunction(scope, iElement, iAttrs, controller){
                    var maskProcessed = false, eventsBound = false,
                        maskCaretMap, maskPatterns, maskPlaceholder, maskComponents,
                    // Minimum required length of the value to be considered valid
                        minRequiredLength,
                        value, valueMasked, isValid,
                    // Vars for initializing/uninitializing
                        originalPlaceholder = iAttrs.placeholder,
                        originalMaxlength = iAttrs.maxlength,
                    // Vars used exclusively in eventHandler()
                        oldValue, oldValueUnmasked, oldCaretPosition, oldSelectionLength;

                    function initialize(maskAttr){
                        if (!angular.isDefined(maskAttr)) {
                            return uninitialize();
                        }
                        processRawMask(maskAttr);
                        if (!maskProcessed) {
                            return uninitialize();
                        }
                        initializeElement();
                        bindEventListeners();
                        return true;
                    }

                    function initPlaceholder(placeholderAttr) {
                        if(! angular.isDefined(placeholderAttr)) {
                            return;
                        }

                        maskPlaceholder = placeholderAttr;

                        // If the mask is processed, then we need to update the value
                        if (maskProcessed) {
                            eventHandler();
                        }
                    }

                    function formatter(fromModelValue){
                        if (!maskProcessed) {
                            return fromModelValue;
                        }
                        value = unmaskValue(fromModelValue || '');
                        isValid = validateValue(value);
                        controller.$setValidity('mask', isValid);
                        return isValid && value.length ? maskValue(value) : undefined;
                    }

                    function parser(fromViewValue){
                        if (!maskProcessed) {
                            return fromViewValue;
                        }
                        value = unmaskValue(fromViewValue || '');
                        isValid = validateValue(value);
                        // We have to set viewValue manually as the reformatting of the input
                        // value performed by eventHandler() doesn't happen until after
                        // this parser is called, which causes what the user sees in the input
                        // to be out-of-sync with what the controller's $viewValue is set to.
                        controller.$viewValue = value.length ? maskValue(value) : '';
                        controller.$setValidity('mask', isValid);
                        if (value === '' && iAttrs.required) {
                            controller.$setValidity('required', !controller.$error.required);
                        }
                        return isValid ? value : undefined;
                    }

                    var linkOptions = {};

                    if (iAttrs.uiOptions) {
                        linkOptions = scope.$eval('[' + iAttrs.uiOptions + ']');
                        if (angular.isObject(linkOptions[0])) {
                            // we can't use angular.copy nor angular.extend, they lack the power to do a deep merge
                            linkOptions = (function(original, current){
                                for(var i in original) {
                                    if (Object.prototype.hasOwnProperty.call(original, i)) {
                                        if (current[i] === undefined) {
                                            current[i] = angular.copy(original[i]);
                                        } else {
                                            angular.extend(current[i], original[i]);
                                        }
                                    }
                                }
                                return current;
                            })(options, linkOptions[0]);
                        }
                    } else {
                        linkOptions = options;
                    }

                    iAttrs.$observe('myUiMask', initialize);
                    iAttrs.$observe('placeholder', initPlaceholder);
                    var modelViewValue = false;
                    iAttrs.$observe('modelViewValue', function(val) {
                        if(val === 'true') {
                            modelViewValue = true;
                        }
                    });
                    scope.$watch(iAttrs.ngModel, function(val) {
                        if(modelViewValue && val) {
                            var model = $parse(iAttrs.ngModel);
                            model.assign(scope, controller.$viewValue);
                        }
                    });
                    controller.$formatters.push(formatter);
                    controller.$parsers.push(parser);

                    function uninitialize(){
                        maskProcessed = false;
                        unbindEventListeners();

                        if (angular.isDefined(originalPlaceholder)) {
                            iElement.attr('placeholder', originalPlaceholder);
                        } else {
                            iElement.removeAttr('placeholder');
                        }

                        if (angular.isDefined(originalMaxlength)) {
                            iElement.attr('maxlength', originalMaxlength);
                        } else {
                            iElement.removeAttr('maxlength');
                        }

                        iElement.val(controller.$modelValue);
                        controller.$viewValue = controller.$modelValue;
                        return false;
                    }

                    function initializeElement(){
                        value = oldValueUnmasked = unmaskValue(controller.$viewValue || '');
                        valueMasked = oldValue = maskValue(value);
                        isValid = validateValue(value);
                        var viewValue = isValid && value.length ? valueMasked : '';
                        if (iAttrs.maxlength) { // Double maxlength to allow pasting new val at end of mask
                            iElement.attr('maxlength', maskCaretMap[maskCaretMap.length - 1] * 2);
                        }
                        iElement.attr('placeholder', maskPlaceholder);
                        iElement.val(viewValue);
                        controller.$viewValue = viewValue;
                        // Not using $setViewValue so we don't clobber the model value and dirty the form
                        // without any kind of user interaction.
                    }

                    function bindEventListeners(){
                        if (eventsBound) {
                            return;
                        }
                        iElement.bind('blur', blurHandler);
                        iElement.bind('mousedown mouseup', mouseDownUpHandler);
                        iElement.bind('input keyup click focus', eventHandler);
                        eventsBound = true;
                    }

                    function unbindEventListeners(){
                        if (!eventsBound) {
                            return;
                        }
                        iElement.unbind('blur', blurHandler);
                        iElement.unbind('mousedown', mouseDownUpHandler);
                        iElement.unbind('mouseup', mouseDownUpHandler);
                        iElement.unbind('input', eventHandler);
                        iElement.unbind('keyup', eventHandler);
                        iElement.unbind('click', eventHandler);
                        iElement.unbind('focus', eventHandler);
                        eventsBound = false;
                    }

                    function validateValue(value){
                        // Zero-length value validity is ngRequired's determination
                        return value.length ? value.length >= minRequiredLength : true;
                    }

                    function unmaskValue(value){
                        var valueUnmasked = '',
                            maskPatternsCopy = maskPatterns.slice();
                        // Preprocess by stripping mask components from value
                        value = value.toString();
                        angular.forEach(maskComponents, function (component){
                            value = value.replace(component, '');
                        });
                        angular.forEach(value.split(''), function (chr){
                            if (maskPatternsCopy.length && maskPatternsCopy[0].test(chr)) {
                                valueUnmasked += chr;
                                maskPatternsCopy.shift();
                            }
                        });
                        return valueUnmasked;
                    }

                    function maskValue(unmaskedValue){
                        var valueMasked = '',
                            maskCaretMapCopy = maskCaretMap.slice();

                        angular.forEach(maskPlaceholder.split(''), function (chr, i){
                            if (unmaskedValue.length && i === maskCaretMapCopy[0]) {
                                valueMasked  += unmaskedValue.charAt(0) || '_';
                                unmaskedValue = unmaskedValue.substr(1);
                                maskCaretMapCopy.shift();
                            }
                            else {
                                valueMasked += chr;
                            }
                        });
                        return valueMasked;
                    }

                    function getPlaceholderChar(i) {
                        var placeholder = iAttrs.placeholder;

                        if (typeof placeholder !== 'undefined' && placeholder[i]) {
                            return placeholder[i];
                        } else {
                            return '_';
                        }
                    }

                    // Generate array of mask components that will be stripped from a masked value
                    // before processing to prevent mask components from being added to the unmasked value.
                    // E.g., a mask pattern of '+7 9999' won't have the 7 bleed into the unmasked value.
                    // If a maskable char is followed by a mask char and has a mask
                    // char behind it, we'll split it into it's own component so if
                    // a user is aggressively deleting in the input and a char ahead
                    // of the maskable char gets deleted, we'll still be able to strip
                    // it in the unmaskValue() preprocessing.
                    function getMaskComponents() {
                        return maskPlaceholder.replace(/[_]+/g, '_').replace(/([^_]+)([a-zA-Z0-9])([^_])/g, '$1$2_$3').split('_');
                    }

                    function processRawMask(mask){
                        var characterCount = 0;

                        maskCaretMap    = [];
                        maskPatterns    = [];
                        maskPlaceholder = '';

                        if (typeof mask === 'string') {
                            minRequiredLength = 0;

                            var isOptional = false,
                                numberOfOptionalCharacters = 0,
                                splitMask  = mask.split('');

                            angular.forEach(splitMask, function (chr, i){
                                if (linkOptions.maskDefinitions[chr]) {

                                    maskCaretMap.push(characterCount);

                                    maskPlaceholder += getPlaceholderChar(i - numberOfOptionalCharacters);
                                    maskPatterns.push(linkOptions.maskDefinitions[chr]);

                                    characterCount++;
                                    if (!isOptional) {
                                        minRequiredLength++;
                                    }
                                }
                                else if (chr === '?') {
                                    isOptional = true;
                                    numberOfOptionalCharacters++;
                                }
                                else {
                                    maskPlaceholder += chr;
                                    characterCount++;
                                }
                            });
                        }
                        // Caret position immediately following last position is valid.
                        maskCaretMap.push(maskCaretMap.slice().pop() + 1);

                        maskComponents = getMaskComponents();
                        maskProcessed  = maskCaretMap.length > 1 ? true : false;
                    }

                    function blurHandler(){
                        if (linkOptions.clearOnBlur) {
                            oldCaretPosition = 0;
                            oldSelectionLength = 0;
                            if (!isValid || value.length === 0) {
                                valueMasked = '';
                                iElement.val('');
                                scope.$apply(function () {
                                    controller.$setViewValue('');
                                });
                            }
                        }
                    }

                    function mouseDownUpHandler(e){
                        if (e.type === 'mousedown') {
                            iElement.bind('mouseout', mouseoutHandler);
                        } else {
                            iElement.unbind('mouseout', mouseoutHandler);
                        }
                    }

                    iElement.bind('mousedown mouseup', mouseDownUpHandler);

                    function mouseoutHandler(){
                        /*jshint validthis: true */
                        oldSelectionLength = getSelectionLength(this);
                        iElement.unbind('mouseout', mouseoutHandler);
                    }

                    function eventHandler(e){
                        /*jshint validthis: true */
                        e = e || {};
                        // Allows more efficient minification
                        var eventWhich = e.which,
                            eventType = e.type;

                        // Prevent shift and ctrl from mucking with old values
                        if (eventWhich === 16 || eventWhich === 91) { return;}

                        var val = iElement.val(),
                            valOld = oldValue,
                            valMasked,
                            valUnmasked = unmaskValue(val),
                            valUnmaskedOld = oldValueUnmasked,
                            valAltered = false,

                            caretPos = getCaretPosition(this) || 0,
                            caretPosOld = oldCaretPosition || 0,
                            caretPosDelta = caretPos - caretPosOld,
                            caretPosMin = maskCaretMap[0],
                            caretPosMax = maskCaretMap[valUnmasked.length] || maskCaretMap.slice().shift(),

                            selectionLenOld = oldSelectionLength || 0,
                            isSelected = getSelectionLength(this) > 0,
                            wasSelected = selectionLenOld > 0,

                        // Case: Typing a character to overwrite a selection
                            isAddition = (val.length > valOld.length) || (selectionLenOld && val.length > valOld.length - selectionLenOld),
                        // Case: Delete and backspace behave identically on a selection
                            isDeletion = (val.length < valOld.length) || (selectionLenOld && val.length === valOld.length - selectionLenOld),
                            isSelection = (eventWhich >= 37 && eventWhich <= 40) && e.shiftKey, // Arrow key codes

                            isKeyLeftArrow = eventWhich === 37,
                        // Necessary due to "input" event not providing a key code
                            isKeyBackspace = eventWhich === 8 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === -1)),
                            isKeyDelete = eventWhich === 46 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === 0 ) && !wasSelected),

                        // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
                        // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
                        // non-mask character. Also applied to click since users are (arguably) more likely to backspace
                        // a character when clicking within a filled input.
                            caretBumpBack = (isKeyLeftArrow || isKeyBackspace || eventType === 'click') && caretPos > caretPosMin;

                        oldSelectionLength = getSelectionLength(this);

                        // These events don't require any action
                        if (isSelection || (isSelected && (eventType === 'click' || eventType === 'keyup'))) {
                            return;
                        }

                        // Value Handling
                        // ==============

                        // User attempted to delete but raw value was unaffected--correct this grievous offense
                        if ((eventType === 'input') && isDeletion && !wasSelected && valUnmasked === valUnmaskedOld) {
                            while (isKeyBackspace && caretPos > caretPosMin && !isValidCaretPosition(caretPos)) {
                                caretPos--;
                            }
                            while (isKeyDelete && caretPos < caretPosMax && maskCaretMap.indexOf(caretPos) === -1) {
                                caretPos++;
                            }
                            var charIndex = maskCaretMap.indexOf(caretPos);
                            // Strip out non-mask character that user would have deleted if mask hadn't been in the way.
                            valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
                            valAltered = true;
                        }

                        // Update values
                        valMasked = maskValue(valUnmasked);

                        oldValue = valMasked;
                        oldValueUnmasked = valUnmasked;
                        iElement.val(valMasked);
                        if (valAltered) {
                            // We've altered the raw value after it's been $digest'ed, we need to $apply the new value.
                            scope.$apply(function (){
                                controller.$setViewValue(valUnmasked);
                            });
                        }

                        // Caret Repositioning
                        // ===================

                        // Ensure that typing always places caret ahead of typed character in cases where the first char of
                        // the input is a mask char and the caret is placed at the 0 position.
                        if (isAddition && (caretPos <= caretPosMin)) {
                            caretPos = caretPosMin + 1;
                        }

                        if (caretBumpBack) {
                            caretPos--;
                        }

                        // Make sure caret is within min and max position limits
                        caretPos = caretPos > caretPosMax ? caretPosMax : caretPos < caretPosMin ? caretPosMin : caretPos;

                        // Scoot the caret back or forth until it's in a non-mask position and within min/max position limits
                        while (!isValidCaretPosition(caretPos) && caretPos > caretPosMin && caretPos < caretPosMax) {
                            caretPos += caretBumpBack ? -1 : 1;
                        }

                        if ((caretBumpBack && caretPos < caretPosMax) || (isAddition && !isValidCaretPosition(caretPosOld))) {
                            caretPos++;
                        }
                        oldCaretPosition = caretPos;
                        setCaretPosition(this, caretPos);
                    }

                    function isValidCaretPosition(pos){ return maskCaretMap.indexOf(pos) > -1; }

                    function getCaretPosition(input){
                        if (!input) {
                            return 0;
                        }
                        if (input.selectionStart !== undefined) {
                            return input.selectionStart;
                        } else if (document.selection) {
                            if (iElement.is(':focus')) {
                                // Curse you IE
                                input.focus();
                                var selection = document.selection.createRange();
                                selection.moveStart('character', input.value ? -input.value.length : 0);
                                return selection.text.length;
                            }
                        }
                        return 0;
                    }

                    function setCaretPosition(input, pos){
                        if (!input) {
                            return 0;
                        }
                        if (input.offsetWidth === 0 || input.offsetHeight === 0) {
                            return; // Input's hidden
                        }
                        if (input.setSelectionRange) {
                            if (iElement.is(':focus')) {
                                input.focus();
                                input.setSelectionRange(pos, pos);
                            }
                        }
                        else if (input.createTextRange) {
                            // Curse you IE
                            var range = input.createTextRange();
                            range.collapse(true);
                            range.moveEnd('character', pos);
                            range.moveStart('character', pos);
                            range.select();
                        }
                    }

                    function getSelectionLength(input){
                        if (!input) {
                            return 0;
                        }
                        if (input.selectionStart !== undefined) {
                            return (input.selectionEnd - input.selectionStart);
                        }
                        if (document.selection) {
                            return (document.selection.createRange().text.length);
                        }
                        return 0;
                    }

                    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
                    if (!Array.prototype.indexOf) {
                        Array.prototype.indexOf = function (searchElement /*, fromIndex */){
                            if (this === null) {
                                throw new TypeError();
                            }
                            var t = Object(this);
                            var len = t.length >>> 0;
                            if (len === 0) {
                                return -1;
                            }
                            var n = 0;
                            if (arguments.length > 1) {
                                n = Number(arguments[1]);
                                if (n !== n) { // shortcut for verifying if it's NaN
                                    n = 0;
                                } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                                }
                            }
                            if (n >= len) {
                                return -1;
                            }
                            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
                            for (; k < len; k++) {
                                if (k in t && t[k] === searchElement) {
                                    return k;
                                }
                            }
                            return -1;
                        };
                    }

                };
            }
        };
    }
    ]);

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
    'zakaz-xd.demo',
    'zakaz-xd.demo2'
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
                })
                .state('demo2', {
                    url: '/demo2',
                    controller: 'Demo2Ctrl',
                    templateUrl: 'app/main-pages/demo/demo2.tpl.html',
                    resolve: {
                    }
                });
        }
    ]);

angular
    .module('zakaz-xd.demo', [
        'zakaz-xd.directives.decimal',
        'zakaz-xd.directives.my-dropdown',
        'zakaz-xd.directives.my.ui.mask',
        'ui.select',
        'ngSanitize',
        'ui.bootstrap',
        'nvd3'
    ])
    .factory("dateParserHelpers", [function () {
        var cache = {};
        return {
            getInteger: function (string, startPoint, minLength, maxLength) {
                var val = string.substring(startPoint);
                var matcher = cache[minLength + "_" + maxLength];
                if (!matcher) {
                    matcher = new RegExp("^(\\d{" + minLength + "," + maxLength + "})");
                    cache[minLength + "_" + maxLength] = matcher;
                }
                var match = matcher.exec(val);
                if (match) {
                    return match[1];
                }
                return null;
            }
        };
    }])
    .factory("$dateParser", ["$locale", "dateParserHelpers", function ($locale, dateParserHelpers) {
        var datetimeFormats = $locale.DATETIME_FORMATS;
        var monthNames = datetimeFormats.MONTH.concat(datetimeFormats.SHORTMONTH);
        var dayNames = datetimeFormats.DAY.concat(datetimeFormats.SHORTDAY);
        return function (val, format) {
            if (angular.isDate(val)) {
                return val;
            }
            try {
                val = val + "";
                format = format + "";
                if (!format.length) {
                    return new Date(val);
                }
                if (datetimeFormats[format]) {
                    format = datetimeFormats[format];
                }
                var now = new Date(), i_val = 0, i_format = 0, format_token = "", year = now.getFullYear(), month = now.getMonth() + 1, /*date = now.getDate()*/ date = 1, hh = 0, mm = 0, ss = 0, sss = 0, ampm = "am", z = 0, parsedZ = false;
                while (i_format < format.length) {
                    format_token = format.charAt(i_format);
                    var token = "";
                    if (format.charAt(i_format) == "'") {
                        var _i_format = i_format;
                        while (format.charAt(++i_format) != "'" && i_format < format.length) {
                            token += format.charAt(i_format);
                        }
                        if (val.substring(i_val, i_val + token.length) != token) {
                            throw "Pattern value mismatch";
                        }
                        i_val += token.length;
                        i_format++;
                        continue;
                    }
                    while (format.charAt(i_format) == format_token && i_format < format.length) {
                        token += format.charAt(i_format++);
                    }
                    if (token == "yyyy" || token == "yy" || token == "y") {
                        var minLength, maxLength;
                        if (token == "yyyy") {
                            minLength = 4;
                            maxLength = 4;
                        }
                        if (token == "yy") {
                            minLength = 2;
                            maxLength = 2;
                        }
                        if (token == "y") {
                            minLength = 2;
                            maxLength = 4;
                        }
                        year = dateParserHelpers.getInteger(val, i_val, minLength, maxLength);
                        if (year === null) {
                            throw "Invalid year";
                        }
                        i_val += year.length;
                        if (year.length == 2) {
                            if (year > 70) {
                                year = 1900 + (year - 0);
                            } else {
                                year = 2e3 + (year - 0);
                            }
                        }
                    } else if (token === "MMMM" || token == "MMM") {
                        month = 0;
                        for (var i = 0; i < monthNames.length; i++) {
                            var month_name = monthNames[i];
                            if (val.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
                                month = i + 1;
                                if (month > 12) {
                                    month -= 12;
                                }
                                i_val += month_name.length;
                                break;
                            }
                        }
                        if (month < 1 || month > 12) {
                            throw "Invalid month";
                        }
                    } else if (token == "EEEE" || token == "EEE") {
                        for (var j = 0; j < dayNames.length; j++) {
                            var day_name = dayNames[j];
                            if (val.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
                                i_val += day_name.length;
                                break;
                            }
                        }
                    } else if (token == "MM" || token == "M") {
                        month = dateParserHelpers.getInteger(val, i_val, token.length, 2);
                        if (month === null || month < 1 || month > 12) {
                            throw "Invalid month";
                        }
                        i_val += month.length;
                    } else if (token == "dd" || token == "d") {
                        date = dateParserHelpers.getInteger(val, i_val, token.length, 2);
                        if (date === null || date < 1 || date > 31) {
                            throw "Invalid date";
                        }
                        i_val += date.length;
                    } else if (token == "HH" || token == "H") {
                        hh = dateParserHelpers.getInteger(val, i_val, token.length, 2);
                        if (hh === null || hh < 0 || hh > 23) {
                            throw "Invalid hours";
                        }
                        i_val += hh.length;
                    } else if (token == "hh" || token == "h") {
                        hh = dateParserHelpers.getInteger(val, i_val, token.length, 2);
                        if (hh === null || hh < 0 || hh > 12) {
                            throw "Invalid hours";
                        }
                        i_val += hh.length;
                    } else if (token == "mm" || token == "m") {
                        mm = dateParserHelpers.getInteger(val, i_val, token.length, 2);
                        if (mm === null || mm < 0 || mm > 59) {
                            throw "Invalid minutes";
                        }
                        i_val += mm.length;
                    } else if (token == "ss" || token == "s") {
                        ss = dateParserHelpers.getInteger(val, i_val, token.length, 2);
                        if (ss === null || ss < 0 || ss > 59) {
                            throw "Invalid seconds";
                        }
                        i_val += ss.length;
                    } else if (token === "sss") {
                        sss = dateParserHelpers.getInteger(val, i_val, 3, 3);
                        if (sss === null || sss < 0 || sss > 999) {
                            throw "Invalid milliseconds";
                        }
                        i_val += 3;
                    } else if (token == "a") {
                        if (val.substring(i_val, i_val + 2).toLowerCase() == "am") {
                            ampm = "AM";
                        } else if (val.substring(i_val, i_val + 2).toLowerCase() == "pm") {
                            ampm = "PM";
                        } else {
                            throw "Invalid AM/PM";
                        }
                        i_val += 2;
                    } else if (token == "Z") {
                        parsedZ = true;
                        if (val[i_val] === "Z") {
                            z = 0;
                            i_val += 1;
                        } else {
                            var txStr;
                            if (val[i_val + 3] === ":") {
                                tzStr = val.substring(i_val, i_val + 6);
                                z = parseInt(tzStr.substr(0, 3), 10) * 60 + parseInt(tzStr.substr(4, 2), 10);
                                i_val += 6;
                            } else {
                                tzStr = val.substring(i_val, i_val + 5);
                                z = parseInt(tzStr.substr(0, 3), 10) * 60 + parseInt(tzStr.substr(3, 2), 10);
                                i_val += 5;
                            }
                        }
                        if (z > 720 || z < -720) {
                            throw "Invalid timezone";
                        }
                    } else {
                        if (val.substring(i_val, i_val + token.length) != token) {
                            throw "Pattern value mismatch";
                        } else {
                            i_val += token.length;
                        }
                    }
                }
                if (i_val != val.length) {
                    throw "Pattern value mismatch";
                }
                year = parseInt(year, 10);
                month = parseInt(month, 10);
                date = parseInt(date, 10);
                hh = parseInt(hh, 10);
                mm = parseInt(mm, 10);
                ss = parseInt(ss, 10);
                sss = parseInt(sss, 10);
                if (month == 2) {
                    if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
                        if (date > 29) {
                            throw "Invalid date 29";
                        }
                    } else {
                        if (date > 28) {
                            throw "Invalid date 28";
                        }
                    }
                }
                if (month == 4 || month == 6 || month == 9 || month == 11) {
                    if (date > 30) {
                        throw "Invalid date";
                    }
                }
                if (hh < 12 && ampm == "PM") {
                    hh += 12;
                } else if (hh > 11 && ampm == "AM") {
                    hh -= 12;
                }
                var localDate = new Date(year, month - 1, date, hh, mm, ss, sss);
                if (parsedZ) {
                    return new Date(localDate.getTime() - (z + localDate.getTimezoneOffset()) * 6e4);
                }
                return localDate;
            } catch (e) {
                return undefined;
            }
        };
    }])
    .filter('month', function () {
        return function (value) {
            var monthes = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
            var num = parseInt(value, 10);

            return monthes[num - 1];
        };
    })
    .controller('DemoCtrl', ['$scope', '$stateParams', '$state', '$modal', "$filter", "$dateParser",
        function ($scope, $stateParams, $state, $modal, $filter, $dateParser) {

            $scope.mask = '99.99.9999';
            $scope.placeholder = 'ДД.ММ.ГГГГ';

            $scope.models = {
                lowercase: 'my test str',
                lowercase1: ''
            };

            $scope.toggled = function(open) {
                console.log('Dropdown is now: ', open);
            };

            $scope.openModal = function () {
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    size: 'lg',
                    templateUrl: 'app/main-pages/demo/test-dialog.tpl.html',
                    resolve: {},
                    controller: function ($scope, $modalInstance) {
                        $scope.close = function () {
                            $modalInstance.close();
                        };
                    }
                });
            };


            $scope.models.banEnterZeroVal = 0;

            ////////////////////////////////////////////////////////////////////

            var PERIOD_FORMAT = 'MM.yyyy',
                TITLE_CHARGED = 'Начислено',
                TITLE_PAID = 'Оплачено',
                LABEL_DIMENSIONS = ', руб.',
                colorArray = ['#60B044', '#BA1F0A'];

            var xAxisKeys = {
                charged: TITLE_CHARGED + LABEL_DIMENSIONS,
                paid: TITLE_PAID + LABEL_DIMENSIONS
            };

            var xAxisLabels = {};
            xAxisLabels[xAxisKeys.charged] = TITLE_CHARGED;
            xAxisLabels[xAxisKeys.paid] = TITLE_PAID;

            $scope.getZeroIfNull = function (number) {
                return number != null ? number : 0;
            };

            $scope.chartData = [
                {key: xAxisKeys.paid, values: []},
                {key: xAxisKeys.charged, values: []}
            ];

            $scope.updateChart = function (items) {
                angular.forEach($scope.chartData, function (item) {
                    item.values = [];
                });

                angular.forEach(items, function (item) {
                    var month = item.periodMonth,
                        paid = $scope.getZeroIfNull(item.paid),
                        charged = $scope.getZeroIfNull(item.charged);

                    if (month.toString().length < 2) {
                        month = '0' + month;
                    }

                    var date = $dateParser(month + '.' + item.periodYear, PERIOD_FORMAT);
                    angular.forEach($scope.chartData, function (chartData) {
                        switch (chartData.key) {
                            case xAxisKeys.charged:
                                chartData.values.push([date, Math.max(charged - paid, 0), charged]);
                                break;
                            case xAxisKeys.paid:
                                chartData.values.push([date, paid, paid]);
                                break;
                            default:
                                break;
                        }
                    });
                });
            };

            $scope.chartDataItems = [
                {"periodYear": 2015, "periodMonth": 9, "charged": 418.25, "paid": 10.45},
                {"periodYear": 2015, "periodMonth": 10, "charged": 0, "paid": 0},
                {"periodYear": 2015, "periodMonth": 11, "charged": 250, "paid": 50},
                {"periodYear": 2015, "periodMonth": 12, "charged": 0, "paid": 0},
                {"periodYear": 2016, "periodMonth": 1, "charged": 0, "paid": 0},
                {"periodYear": 2016, "periodMonth": 2, "charged": 0, "paid": 0}
            ];

            function transformItemsToMultiBarChart(paymentItems) {
                var chartData = [
                    {key: xAxisKeys.paid, values: []},
                    {key: xAxisKeys.charged, values: []}
                ];
                if (!paymentItems) {
                    return chartData;
                }

                for (var i=0; i<paymentItems.length; ++i) {
                    var payment = paymentItems[i];

                    var month = payment.periodMonth,
                        paid = $scope.getZeroIfNull(payment.paid),
                        charged = $scope.getZeroIfNull(payment.charged);

                    if (month.toString().length < 2) {
                        month = '0' + month;
                    }

                    var date = $dateParser(month + '.' + payment.periodYear, PERIOD_FORMAT);

                    // оплачено
                    chartData[0].values.push({x: date, y: paid, realValue: paid});
                    // начислено
                    chartData[1].values.push({x: date, y: Math.max(charged - paid, 0), realValue: charged});

                }
                return chartData;
            }

            var chartDomElements = {};

            function onRenderEnd(e) {
                if (!chartDomElements.layer) {
                    return;
                }
                // recalculateChargedBar
                var w = nv.utils.availableWidth(null, $scope.chartScope.svg, {left: 117, right: 0});
                console.log('$scope.chartScope', w);
                //console.log('this', this);
                //var y = d3.scale.linear()
                //    .domain([0, 500])
                //    .range([300, 0]);
                //chartDomElements.rect
                    //.duration(500)
                    //.delay(function(d, i) { return i * 10; })

                    //.attr("y", function(d) {
                    //    if (d.y!==null && d.y0 !== undefined) {
                    //        return y(d.y);//y(d.y0 + d.y);
                    //    } else {
                    //        return this.getAttribute("y");
                    //    }
                    //
                    //})
                    //.attr("height", function(d) {
                    //    if (d.y!==null && d.y0 !== undefined) {
                    //        return y(0) - y(d.y);
                    //    } else {
                    //        return this.getAttribute("height");
                    //    }
                    //
                    //}).transition();

                    //.attr("x", function(d) { return x(d.x); })
                    //.attr("width", x.rangeBand());

                //chartDomElements.svg.selectAll(".nv-x.nv-axis .tick text").each(function(t){console.log("text", t);})
                chartDomElements.svg.selectAll(".nv-x.nv-axis .tick text").each(
                    function(el, i) {
                        var text = d3.select(this);
                        var words = text.text().split(/\s+/).reverse();
                        //console.log("text: ", text);
                        //console.log("words: ", words);

                        var word,
                        //line = [],
                            lineNumber = 0,
                            lineHeight = 1.1, // ems
                            y = text.attr("y"),
                            dy = parseFloat(text.attr("dy")),
                            tspan = text.text(null);//.append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                        while (word = words.pop()) {
                            //line.push(word);
                            //tspan.text(line.join(" "));
                            //if (tspan.node().getComputedTextLength() > 40) {
                            //line.pop();
                            //tspan.text(line.join(" "));
                            //line = [word];
                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineNumber * lineHeight + dy + "em").text(word);
                            ++lineNumber;
                            //}
                        }

                        //.filter(function(d,i) {
                        //    return ;
                        //})

                        // скрыть tick подписи по x которые не убираются по ширине
                        if (i % Math.ceil($scope.chartData[0].values.length / (w / 100)) !== 0) {
                            text.style('opacity', 0);
                        }


                    }
                );

            //.filter(function(d,i) {
            //        return i % Math.ceil(data[0].values.length / (availableWidth / 100)) !== 0;
            //    })
            //        .selectAll('text, line')
            //        .style('opacity', 0);
            }

            $scope.chartApi = {};

            $scope.chartScope = {};



            $scope.onChartReady = function(scope, element) {
                //var layer = svg.selectAll(".layer");
                var api = scope.api;
                var chart = scope.chart;
                var svg = scope.svg;

                $scope.chartScope = scope;

                var layer = svg.selectAll(".nv-group");
                var rect = layer.selectAll("rect");

                chartDomElements.layer = layer;
                chartDomElements.rect = rect;
                chartDomElements.svg = svg;


                onRenderEnd();

                //var oldUpdateFn = scope.api.update;
                //scope.api.update = function() {
                //    oldUpdateFn.apply(this, arguments);
                //    console.log("new update fn: " , this);
                //};
                //
                //var oldUpdateWithDataFn = scope.api.updateWithData;
                //scope.api.updateWithData = function() {
                //    oldUpdateWithDataFn.apply(this, arguments);
                //    console.log("new oldUpdateWithDataFn fn: " , this);
                //};
            };

            $scope.chartOptions = {
                chart: {
                    type: 'multiBarChart',
                    stacked: true,
                    height: 300,
                    margin: {
                        left: 117,
                        right: 0
                    },
                    //x: function (d) {
                    //    return $filter('month')(d[0].getMonth() + 1) + ' ' + d[0].getFullYear() + 'г.';
                    //},
                    //y: function (d) {
                    //    return d3.format('.02f')(d[1]);
                    //},
                    noData: "Данные за выбранный период отсутствуют!",
                    color: function (d, i) {
                        return colorArray[i];
                    },
                    reduceXTicks: false,
                    rotateLabels: 0,      //Angle to rotate x-axis labels.
                    showControls: true,   //Allow user to switch between 'Grouped' and 'Stacked' mode.
                    groupSpacing: 0.1,
                    //legendColor: function (d, i) {
                    //    return colorArray[i];
                    //},
                    //reduceXTicks: true,
                    //objectEquality: true,
                    //stacked: true,

                    //valueFormat: function(d){
                    //    return d3.format(',.4f')(d);
                    //},
                    duration: 0,
                    dispatch: {
                        beforeUpdate: function(e){
                            console.log('! before UPDATE !');
                        },
                        renderEnd: onRenderEnd
                        //renderEnd: function(e) {
                        //    console.log('renderEnd: ', e);
                        //}
                    },
                    xAxis: {
                        tickSize: 0,
                        //tickPadding: 0,
                        tickFormat: function (d) {
                            //console.log("xAxis format", d);
                            return $filter('month')(d.getMonth() + 1) + ' ' + d.getFullYear() + 'г.';
                        }

                    },
                    yAxis: {
                        tickFormat: function (d) {return d3.format('.02f')(d);}
                    }
                    //tooltips: true,
                    //tooltipcontent: function (key, x, y, e) {
                    //    var label = xAxisLabels[key],
                    //        amount = $filter('currency')(e.series.values[e.pointIndex][2]);
                    //    return '<h3>' + label + '</h3>' + '<p>' + amount + ' за ' + x + '</p>';
                    //}


                    //tooltips: true,
                    //
                    //
                    //
                    //type: 'discreteBarChart',
                    //height: 300,
                    //
                    //showXAxis: true,
                    //showYAxis: true,
                    //showLegend: true,
                    //tooltips: true,
                    //tooltipcontent: function (key, x, y, e) {
                    //    var label = xAxisLabels[key],
                    //        amount = $filter('currency')(e.series.values[e.pointIndex][2]);
                    //    return '<h3>' + label + '</h3>' + '<p>' + amount + ' за ' + x + '</p>';
                    //},
                    //xAxisTickFormat: function (d) {return $filter('month')(d.getMonth() + 1) + ' ' + d.getFullYear() + 'г.';},
                    //yAxisTickFormat: function (d) {return d3.format('.02f')(d);},
                    //
                    //delay: "0",
                    //noData: "Данные за выбранный период отсутствуют!",
                    //color: function (d, i) {return colorArray[i];},
                    //legendColor: function (d, i) {return colorArray[i];},
                    //reduceXTicks: true,
                    //objectEquality: true,
                    //stacked: true,
                    //margin : {
                    //    left: 117
                    //}
                },
                callback: function(e) {
                    console.log('! callback !');
                }
            };

            /* Inspired by Lee Byron's test data generator. */
            //function stream_layers(n, m, o) {
            //    if (arguments.length < 3) {
            //        o = 0;
            //    }
            //    function bump(a) {
            //        var x = 1 / (0.1 + Math.random()),
            //            y = 2 * Math.random() - 0.5,
            //            z = 10 / (0.1 + Math.random());
            //        for (var i = 0; i < m; i++) {
            //            var w = (i / m - y) * z;
            //            a[i] += x * Math.exp(-w * w);
            //        }
            //    }
            //    var series = d3.range(n).map(function() {
            //        var a = [], i;
            //        for (i = 0; i < m; i++) {
            //            a[i] = o + o * Math.random();
            //        }
            //        for (i = 0; i < 5; i++) {
            //            bump(a);
            //        }
            //        return a.map(stream_index);
            //    });
            //    console.log("series: ", series);
            //    return series;
            //}

            /* Another layer generator using gamma distributions. */
            //function stream_waves(n, m) {
            //    return d3.range(n).map(function(i) {
            //        return d3.range(m).map(function(j) {
            //            var x = 20 * j / m - i / 3;
            //            return 2 * x * Math.exp(-0.5 * x);
            //        }).map(stream_index);
            //    });
            //}

            function stream_index(d, i) {
                return {x: i, y: Math.max(0, d)};
            }



            //Generate some nice data.
            //function exampleData() {
            //    return stream_layers(3, 10+Math.random()*100, 0.1).map(function(data, i) {
            //        return {
            //            key: 'Stream #' + i,
            //            values: data
            //        };
            //    });
            //}

            //stream_layers(3, 10+Math.random()*100, 0.1);

            //$scope.chartDataItems = exampleData();

            //var items = exampleData();
            //console.log("chartData", items);

            $scope.chartData = transformItemsToMultiBarChart($scope.chartDataItems);
            console.log("chartData", $scope.chartData);

            //$scope.updateChart($scope.chartDataItems);

            // Inspired by Lee Byron's test data generator.
            //function bumpLayer(n, o) {
            //
            //    function bump(a) {
            //        var x = 1 / (0.1 + Math.random()),
            //            y = 2 * Math.random() - 0.5,
            //            z = 10 / (0.1 + Math.random());
            //        for (var i = 0; i < n; i++) {
            //            var w = (i / n - y) * z;
            //            a[i] += x * Math.exp(-w * w);
            //        }
            //    }
            //
            //    var a = [], i;
            //    for (i = 0; i < n; ++i) {
            //        a[i] = o + o * Math.random();
            //    }
            //    for (i = 0; i < 5; ++i) {
            //        bump(a);
            //    }
            //    return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
            //}
            //
            //var n = 4, // number of layers
            //    m = 58, // number of samples per layer
            //    stack = d3.layout.stack(),
            //    layers = stack(d3.range(n).map(function() { return bumpLayer(m, 0.1); })),
            //    yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
            //    yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });
            //
            //
            //console.log("layers", layers);
            //console.log("yGroupMax", yGroupMax);
            //console.log("yStackMax", yStackMax);
        }
    ])
;

angular
    .module('zakaz-xd.demo2', [
        'zakaz-xd.directives.decimal',
        'zakaz-xd.directives.my-dropdown',
        'common.hcs-dropdown2',
        'zakaz-xd.directives.my.ui.mask',
        'ui.select',
        'ngSanitize',
        'ui.bootstrap'
    ])
    .controller('Demo2Ctrl', ['$scope', '$stateParams', '$state', '$modal', "$filter", "$dateParser",
        function ($scope, $stateParams, $state, $modal, $filter, $dateParser) {

            $scope.toggled = function(open) {
                console.log('Dropdown is now: ', open);
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

angular.module('zakaz-xd.user-profile.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.dialogs',
    'zakaz-xd.resources.users-resource'
])
    .config(['$stateProvider', '$urlRouterProvider', 'ACCESS',
        function ($stateProvider, $urlRouterProvider, ACCESS) {

            $stateProvider
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
                .state('user-profile-add-delivery-point', {
                    url: '/profile/add-delivery-point',
                    controller: 'UserProfileDeliveryPointCtrl',
                    templateUrl: 'app/main-pages/user-profile/delivery-point/delivery-point.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.EDIT_OWN_ORDER);
                        },
                        deliveryPoint: function() {
                            return {};
                        },
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
                        }
                    }
                })
                .state('user-profile-edit-delivery-point', {
                    url: '/profile/edit-delivery-point/:deliveryPointId',
                    controller: 'UserProfileDeliveryPointCtrl',
                    templateUrl: 'app/main-pages/user-profile/delivery-point/delivery-point.tpl.html',
                    resolve: {
                        hasAccess: function ($stateParams, AuthService) {
                            return AuthService.checkAccess(ACCESS.EDIT_OWN_ORDER);
                        },
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
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

/**
 * Просмотр редактирование информации пользователя
 */
angular
    .module('zakaz-xd.user-profile', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.auth-resource',
        'zakaz-xd.auth',
        'zakaz-xd.user-profile.states',
        'zakaz-xd.user-profile.delivery-point'
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
                        $state.go('user-orders-list');
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

angular
    .module('zakaz-xd.orders.all-orders-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.directives.pagination',
        'zakaz-xd.directives.daterange',
        'zakaz-xd.resources.orders-resource',
        'zakaz-xd.auth'
    ])
    .controller('AllOrdersListCtrl', ['$scope', '$stateParams', '$state', 'OrdersResource',
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

            $scope.searchParameters = {
                dateStart: null,
                dateEnd: null
            };

            $scope.applySearch = function () {
                console.log("search", $scope.searchParameters );
            };

            function refreshOrdersTable(page) {
                OrdersResource.getAllOrders(page).then(
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
 * Изменение\создание заказа
 */
angular
    .module('zakaz-xd.orders.edit-order', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.orders-resource',
        'zakaz-xd.auth'
    ])
    .controller('EditOrderCtrl', ['$scope', '$stateParams', '$state', 'OrdersResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'order', 'user', 'author', 'AuthService',
        function ($scope, $stateParams, $state, OrdersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, order, user, author, AuthService) {
            $scope.AuthService = AuthService;
            $scope.isCreate = !(order._id);
            $scope.order = order;
            $scope.user = user;
            $scope.author = author;

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
            $scope.addComment = function(commentText) {
                OrdersResource.addOrderComment($scope.order._id, {text: commentText}).then(
                    function (response) {
                        InfoDialog.open("Комментарий добавлен");
                        $state.reload();
                    },
                    function (err) {
                        ErrorDialog.open(err.data, true);
                    }
                );
            };

            $scope.removeComment = function(comment) {
                YesNoDialog.open("Удалить комментарий?").then(
                    function() {
                        OrdersResource.removeOrderComment($scope.order._id, comment._id).then(
                            function (response) {
                                InfoDialog.open("Комментарий удален");
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
        'AuthService',
        function ($scope, $stateParams, $state,
                  OrdersResource, ErrorDialog, InfoDialog, YesNoDialog, order, orderProduct, userProducts,
                  AuthService) {
            $scope.AuthService = AuthService;
            $scope.isCreate = !(orderProduct.product);
            $scope.orderProduct = orderProduct;
            $scope.order = order;


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
 * Изменение\создание точки доставки пользователя
 */
angular
    .module('zakaz-xd.user-profile.delivery-point', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.auth'
    ])
    .controller('UserProfileDeliveryPointCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'user', 'deliveryPoint', 'AuthService',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, user, deliveryPoint, AuthService) {
            $scope.isCreate = !(deliveryPoint._id);
            $scope.user = user;
            $scope.deliveryPoint = deliveryPoint;

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    UsersResource.addCurrentUserDeliveryPoint($scope.deliveryPoint).then(
                        function (response) {
                            InfoDialog.open("Точка доставки добавлена");
                            AuthService.reloadCurrentUser();
                            $state.go("user-profile");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                } else {
                    UsersResource.updateCurrentUserDeliveryPoint($scope.deliveryPoint).then(
                        function (response) {
                            InfoDialog.open("Изменение точки доставки успешно");
                            $state.go("user-profile", {id: $scope.user._id});
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
                        UsersResource.removeCurrentUserDeliveryPoint($scope.deliveryPoint._id).then(
                            function (response) {
                                InfoDialog.open("Точка доставки удалена");
                                AuthService.reloadCurrentUser();
                                $state.go("user-profile");
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
