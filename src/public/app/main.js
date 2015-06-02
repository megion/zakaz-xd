angular.module('zakaz-xd.main', [
    'ui.router',
    'auth',
    'zakaz-xd.order-list'
])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
            $urlRouterProvider.otherwise('/orders');

            $stateProvider.state('order-list', {
                url: '/orders',
                views: {
                    content: {
                        controller: 'OrderListCtrl',
                        templateUrl: '/app/main-pages/order-list/order-list.tpl.html'
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
    .controller('ZakazXdCtrl', ['$rootScope', '$scope', '$location', 'AuthService',
        function ($rootScope, $scope, $location, AuthService) {
    }]);
