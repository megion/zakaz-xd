angular.module('zakaz-xd.demo.states', [
    'ui.router',
    'zakaz-xd.auth',
    'zakaz-xd.demo',
    'zakaz-xd.demo2'
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
                })
                .state('demo2', {
                    url: '/demo2',
                    controller: 'Demo2Ctrl',
                    templateUrl: 'app/main-pages/demo/demo2.tpl.html',
                    resolve: {
                    }
                });
        }
    ]);
