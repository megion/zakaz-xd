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
