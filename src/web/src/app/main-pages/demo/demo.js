angular
    .module('zakaz-xd.demo', [
        'zakaz-xd.directives.decimal',
        'zakaz-xd.directives.my-dropdown',
        'zakaz-xd.directives.my.ui.mask',
        'ui.select',
        'ngSanitize',
        'ui.bootstrap'
    ])
    .controller('DemoCtrl', ['$scope', '$stateParams', '$state','$modal',
        function ($scope, $stateParams, $state, $modal) {

            $scope.mask = '99.99.9999';
            $scope.placeholder = 'ДД.ММ.ГГГГ';

            $scope.models = {
                lowercase: 'my test str',
                lowercase1: ''
            };

            $scope.openModal = function () {
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    size: 'lg',
                    templateUrl: 'app/main-pages/demo/test-dialog.tpl.html',
                    resolve: {
                    },
                    controller: function ($scope, $modalInstance) {
                        $scope.close = function () {
                            $modalInstance.close();
                        };
                    }
                });
            };


            $scope.models.banEnterZeroVal = 0;
        }
    ])
;
