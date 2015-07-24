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
