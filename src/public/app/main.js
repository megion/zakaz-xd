angular.module('zakaz-xd.main', [
    'ui.router',
    'auth',
    'zakaz-xd.order-list',
    'zakaz-xd.auth.login'
])
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state("order-list", {
                    url: "/orders",
                    controller: 'OrderListCtrl',
                    templateUrl: 'app/main-pages/order-list/order-list.tpl.html',
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
                })
                .state("login", {
                    url: "/login",
                    controller: 'LoginCtrl',
                    template: 'app/main-pages/auth/login/login.tpl.html'
                })
                .state("bar", {
                    url: "/bar",
                    template: '<h1>bar</h1>'
                });

            $urlRouterProvider.otherwise("/orders");
        }
    ])
    .controller('ZakazXdCtrl', ['$rootScope', '$scope', '$location', 'AuthService',
        function ($rootScope, $scope, $location, AuthService) {
    }]);
