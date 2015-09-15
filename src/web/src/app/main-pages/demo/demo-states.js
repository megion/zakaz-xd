angular.module('zakaz-xd.demo.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.demo'
])
    .config(['$stateProvider', '$urlRouterProvider', 'ACCESS',
        function ($stateProvider, $urlRouterProvider, ACCESS) {

            $stateProvider
                .state('demo', {
                    url: '/demo',
                    controller: 'DemoCtrl',
                    templateUrl: 'app/main-pages/demo/demo.tpl.html',
                    resolve: {
                    }
                });
        }
    ]);
