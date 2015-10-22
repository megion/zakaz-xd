angular
    .module('zakaz-xd.demo', [
        'zakaz-xd.directives.decimal',
        'zakaz-xd.directives.my.ui.mask',
        'ui.select',
        'ngSanitize'
    ])
    .controller('DemoCtrl', ['$scope', '$stateParams', '$state',
        function ($scope, $stateParams, $state) {

            $scope.mask = '99.99.9999';
            $scope.placeholder = '__.__.____';

            $scope.models = {
                lowercase1: ''
            };


        }
    ])
;
