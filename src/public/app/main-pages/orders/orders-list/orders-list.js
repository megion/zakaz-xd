angular
    .module('zakaz-xd.orders.orders-list', [
    ])
    .controller('OrdersListCtrl', ['$scope', '$stateParams', '$state',
        function ($scope, $stateParams, $state) {
            $scope.helloMsg = 'пока пуст';
        }
    ])
;
