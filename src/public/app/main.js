angular.module('zakaz-xd.main', [
])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'AuthProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, AuthProvider) {
            $urlRouterProvider.otherwise('/orders');

            $httpProvider.interceptors.push(function ($q, $location, $cookies, Auth) {
                return {
                    responseError: function (response) {
                        if (response.status === 401 || response.status === 403) {
                            //Auth.refresh();
                        }
                        return $q.reject(response);
                    },
                    request: function (config) {
                        if (config.url.indexOf("/rest/") != -1) {
                            var token = $cookies.token;
                            if (angular.isDefined(token)) {
                                config.headers = config.headers || {};
                                config.headers.token = token;
                            }
                        }
                        return config;
                    }
                };
            });
            AuthProvider.setAuthLocation(config.authLocation);
        }
    ])
    .controller('ZakazXdCtrl', ['$rootScope', '$scope', '$location', 'Auth', function ($rootScope, $scope, $location, Auth) {
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
//            if (!Auth.isLoggedIn() || !Auth.authorize(toState.data.permit)) {
//                event.preventDefault();
//                Auth.refresh();
//            }
        });
    }]);
