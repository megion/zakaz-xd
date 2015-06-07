angular.module('zakaz-xd.main', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.order-list',
    'zakaz-xd.auth.login-form',
    'zakaz-xd.user-profile'
])
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('order-list', {
                    url: '/orders',
                    controller: 'OrderListCtrl',
                    templateUrl: 'app/main-pages/order-list/order-list.tpl.html',
                    resolve: {
                        user: function ($stateParams, AuthService) {
                            return AuthService.getUser();
                        }
                    },
                    data: {
                        pageTitle: 'Список заказов',
                        breadcrumbs: [
                            {
                                url: "#",
                                label: 'Дом'
                            },
                            {
                                url: '#/orders',
                                label: 'Список заказов'
                            }
                        ]
                    }
                })
                .state('login', {
                    url: '/login',
                    controller: 'LoginFormCtrl',
                    templateUrl: 'app/main-pages/auth/login-form/login-form.tpl.html'
                })
                .state('user-profile', {
                    url: '/profile',
                    controller: 'UserProfileCtrl',
                    templateUrl: 'app/main-pages/user-profile/user-profile.tpl.html',
                    resolve: {
                        user: function ($stateParams, AuthService) {
                            return AuthService.getUser();
                        }
                    }
                })
                .state('user-profile-change-password', {
                    url: '/profile/change-password',
                    controller: 'UserProfileCtrl',
                    templateUrl: 'app/main-pages/user-profile/user-profile-change-password.tpl.html',
                    resolve: {
                        user: function ($stateParams, AuthService) {
                            return AuthService.getUser();
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

            $urlRouterProvider.otherwise("/orders");
        }
    ])
    .controller('ZakazXdCtrl', ['$rootScope', '$scope', '$location', 'AuthService',
        function ($rootScope, $scope, $location, AuthService) {

        }
    ]).controller('ZakazXdHeaderCtrl', ['$rootScope', '$scope', '$state', 'AuthService',
        function ($rootScope, $scope, $state, AuthService) {
            $scope.logout = function() {
                AuthService.logout().then(
                    function(response) {
                        $state.go("logout-success");
                    },
                    function(err) {
                        console.error("Error logout", err);
                    }
                );
            };

            $scope.currentUser = function() {
                return AuthService.$getUser();
            };

            $scope.isLogin = function() {
                return AuthService.isAuthenticated();
            };
        }
    ]);
