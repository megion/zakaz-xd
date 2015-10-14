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
