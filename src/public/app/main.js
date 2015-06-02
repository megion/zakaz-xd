angular.module('zakaz-xd.main', [
    'ui.router',
    'auth'
])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
            $urlRouterProvider.otherwise('/orders');


            // AuthProvider.setAuthLocation(config.authLocation);

            $stateProvider.state('view-orders', {
                url: '/orders',
                views: {
                    content: {
                        controller: 'MyCtrl',
                        templateUrl: '/forms/orders/orders.tpl.html'
                    }
                },
                resolve: {
                    user: function ($stateParams) {
                        return "";
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
            });
        }
    ])
    .controller('ZakazXdCtrl', ['$rootScope', '$scope', '$location', 'AuthService', function ($rootScope, $scope, $location, AuthService) {
    }]);
