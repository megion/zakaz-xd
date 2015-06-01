angular.module('zakaz-xd.main', [
    'auth'
])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'AuthProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, AuthProvider) {
            $urlRouterProvider.otherwise('/orders');


            // AuthProvider.setAuthLocation(config.authLocation);
        }
    ])
    .controller('ZakazXdCtrl', ['$rootScope', '$scope', '$location', 'AuthService', function ($rootScope, $scope, $location, AuthService) {
    }]);
