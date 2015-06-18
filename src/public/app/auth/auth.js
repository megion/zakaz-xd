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
                    ErrorDialog.open(error.data, true);
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

        this.$get = ['$injector', '$q',
            function ($injector, $q) {

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
                            isLogin= response.data;
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
                            throw new Error('User is null');
                        }

                        return isAuthorize(currentUser, access);
                    },

                    /**
                     * user is not logged in
                     */
                    notAuthenticated: function() {
                        $injector.get('$state').go('not-authenticated');
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