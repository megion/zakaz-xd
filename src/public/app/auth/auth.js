angular.module('auth', [
    'ngCookies',
    'auth.access'
])

    .factory('AuthInterceptor', ['$q', '$cookies', 'AuthService', function ($q, $cookies, AuthService) {
        return {
            responseError: function (response) {
            	if (response.status === 401) {
            		// user is not logged in
            		AuthService.notAuthenticated();
            	}
                if (response.status === 403) {
                	// user is not allowed
                	AuthService.notAuthorized();
                }
                return $q.reject(response);
            }
            //,
            //request: function (config) {
            //    if (config.url.indexOf("/secure/rest/") != -1) {
            //        var token = $cookies.token;
            //        if (angular.isDefined(token)) {
            //            config.headers = config.headers || {};
            //            config.headers.token = token;
            //        }
            //    }
            //    return config;
            //}
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
                 * Get current user from server
                 */
                function getCurrentUser() {
                    if (currentUserPromise) {
                        return currentUserPromise;
                    }
                    var defer = $q.defer();
                    $injector.get('$http').get('/user/current', { headers: {'If-Modified-Since': '0'}}).then(
                        function (response) {
                            currentUser = response;
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
                    notAuthorized: function() {
                        $injector.get('$state').go('not-authorized');
                    },

                    getUser: function() {
                        if (currentUser) {
                            return $q.when(currentUser);
                        } else {
                            return getCurrentUser();
                        }
                    },
                    login: function (username, password) {
                        var config = {
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                            ignoreAuthInterceptor: true
                        };
                        return $injector.get('$http').post('/login', {username: username, password: password}, config).then(
                            function (response) {
                                console.info("Login success: ", response);
                            },
                            function (err) {
                                console.error("Error login: ", err);
                            }
                        );
                    },
                    logout: function () {
                        return $injector.get('$http').post('/logout', {}).then(
                            function (response) {
                                currentUser = null;
                                currentUserPromise = null;
                            },
                            function (err) {
                                console.error("Error login: ", err);
                            }
                        );
                    }
                };
            }

        ];
    });