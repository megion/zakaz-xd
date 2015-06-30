angular.module('zakaz-xd.main', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.dialogs',
    'zakaz-xd.order-list',
    'zakaz-xd.auth.login-form',
    'zakaz-xd.user-profile',
    'zakaz-xd.manage-users.users-list',
    'zakaz-xd.manage-users.edit-user',
    'zakaz-xd.manage-users.edit-user.change-password'
])
    .config(['$stateProvider', '$urlRouterProvider', 'ACCESS',
        function ($stateProvider, $urlRouterProvider, ACCESS) {

            $stateProvider
                .state('order-list', {
                    url: '/orders',
                    controller: 'OrderListCtrl',
                    templateUrl: 'app/main-pages/order-list/order-list.tpl.html',
                    resolve: {
                        user: function ($stateParams, AuthService) {
                            return AuthService.getCurrentUser();
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
                        user: function($stateParams, UsersResource, ErrorHandler){
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
                    templateUrl: 'app/main-pages/manage-users/edit-user/edit-user-change-password.tpl.html',
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
