angular.module('zakaz-xd.auth', [
    'ngCookies',
    'zakaz-xd.auth.access',
    'zakaz-xd.resources.auth-resource'
])

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
                            console.error('Error get user', err);
                            defer.reject(err);
                            currentUserPromise = null;
                        }
                    );
                    currentUserPromise = defer.promise;
                    return currentUserPromise;
                }

                function getCurrentUser() {
                    if (currentUser) {
                        return $q.when(currentUser);
                    } else {
                        return requestCurrentUser();
                    }
                }

                /**
                 *
                 * @param user
                 * @param access - integer value
                 */
                function isAuthorize(user, access) {
                    for (var i=0; i<user.roles.length; i++) {
                        var userAccess = user.roles[i].access;
                        if (access & userAccess) {
                            return true;
                        }
                    }

                    return false;
                }

                return {

                    isAuthenticated: function () {
                        return !!currentUser;
                    },

                    /**
                     * return promise object
                     * @param access
                     */
                    checkAccess: function (access) {
                        if (currentUser) {
                            if(isAuthorize(currentUser, access)) {
                                return $q.resolve('Current user is allowed access ' + access);
                            } else {
                                return $q.reject('Current user is not allowed access ' + access);
                            }
                        } else {
                            var defer = $q.defer();
                            getCurrentUser().then(
                                function (user) {
                                    if(isAuthorize(user, access)) {
                                        defer.resolve('Current user is allowed access ' + access);
                                    } else {
                                        defer.reject('Current user is not allowed access ' + access);
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

                    getUser: getCurrentUser,
                    $getUser: function() {
                        return currentUser;
                    },

                    login: function (username, password) {
                        var defer = $q.defer();
                        $injector.get('AuthResource').login(username, password).then(
                            function(response) {
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