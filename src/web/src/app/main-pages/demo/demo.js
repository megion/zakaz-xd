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
            $scope.placeholder = 'ДД.ММ.ГГГГ';

            $scope.models = {
                lowercase: 'my test str',
                lowercase1: ''
            };


            $scope.models.banEnterZeroVal = 0;
        }
    ])
;
