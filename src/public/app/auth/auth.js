angular.module('auth', [

])

    .run(['$rootScope', '$state', 'AuthService', function ($rootScope, $state, AuthService) {
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if (toState.data && toState.data.userRoles && toState.data.userRoles.length>0) {
            	
            	if(!AuthService.isAuthenticated()) {
            		$rootScope.fromState = fromState.name;
            		// user is not logged in
            		AuthService.notAuthenticated(event);
            		return;
            	}
            	
                if(!AuthService.isAuthorize(toState.data.access)) {
                	$rootScope.fromState = fromState.name;
                	// user is not allowed
                	AuthService.notAuthorized(event);
            	}
            }
        });
    }])

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
            },
            request: function (config) {
                if (config.url.indexOf("/secure/rest/") != -1) {
                    var token = $cookies.token;
                    if (angular.isDefined(token)) {
                        config.headers = config.headers || {};
                        config.headers.token = token;
                    }
                }
                return config;
            }
        };
    }])

    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    }])

    .provider('AuthService', function () {

        var loginUrl;
        var logoutUrl;

        this.$get = ['$http', '$injector', '$q',
            function ($http, $injector, $q) {

                var currentUser = null;

                /**
                 * Проверяет имеет ли текущий пользователь указаный доступ
                 * @param access - целочисленное значение
                 */
                function isAuthorize(user, access) {
                    var userPermissionsMap = {}; // contains only unique permission
                    for (var i=0; i<user.roles.length; i++) {
                        var userAccess = roles[i].access;
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
                            return $q.when(currentUser);
                        } else {
                            var defer = $q.defer();
                            $http.get('/user/current', { headers: {'If-Modified-Since': '0'}}).then(
                                function (response) {
                                    currentUser = response;
                                    if(isAuthorize(currentUser, access)) {
                                        defer.resolve(currentUser);
                                    }
                                },
                                function (err) {
                                    console.error('Error get user', err);
                                    defer.reject(err);
                                }
                            );
                        }
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



                    /**
                     * Attempts to authenticate a user by the given username and password.
                     *
                     * @param username user's name
                     * @param password user's password
                     */
                    login: function (username, password) {
                        var payload = $.param({j_username: username, j_password: password});
                        var config = {
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                            ignoreAuthInterceptor: true
                        };
                        var self = this;
                        var request = $http.post(opts.loginUrl, payload, config);

                        return request.then(function (response) {
                            self.currentUser = response.data;
                            if (self.isAuthenticated()) {
                                queue.retryAll();
                            }
                            return self.currentUser;
                        });
                    },

                    /**
                     * Logs out the current user and redirects to 'redirectTo'.
                     *
                     * @param redirectTo (optional) the URL to redirect to
                     */
                    logout: function (redirectTo) {
                        var self = this;
                        return $http.post(opts.logoutUrl).then(function () {
                            self.currentUser = null;
                            if (redirectTo) {
                                redirect(redirectTo);
                            }
                        });
                    }
                };
            }


        ];
    });