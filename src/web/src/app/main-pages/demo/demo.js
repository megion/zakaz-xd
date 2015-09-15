angular
    .module('zakaz-xd.demo', [
        'zakaz-xd.directives.decimal',
        'ui.select',
        'ngSanitize'
    ])
    .controller('DemoCtrl', ['$scope', '$stateParams', '$state',
        function ($scope, $stateParams, $state) {

            $scope.models = {
                lowercase1: 'testTEST'
            };


        }
    ])
;
