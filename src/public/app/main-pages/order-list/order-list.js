angular
    .module('zakaz-xd.order-list', [
    ])
    .controller('OrderListCtrl', ['$scope', '$stateParams', '$state',
        function ($scope, $stateParams, $state) {
            $scope.helloMsg = 'пока пуст';
        }
    ])
;
