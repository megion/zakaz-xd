angular.module('zakaz-xd.resources.orders-resource', [
])

    .factory('OrdersResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/orders';
        return {
            createOrder: function (newOrder) {
                return $http.post(startUrl + '/create-order', {order: newOrder});
            },
            editOrder: function (order) {
                return $http.post(startUrl + '/edit-order', {order: order});
            },
            deleteOrder: function (orderId) {
                return $http.post(startUrl + '/delete-order', {orderId: orderId});
            },
            getAllOrders: function (page) {
                return $http.get(startUrl + '/all-orders', {params: page});
            },
            getAllUserOrders: function (page) {
                return $http.get(startUrl + '/user-orders', {params: page});
            },
            getOrderById: function (orderId) {
                return $http.get(startUrl + '/order-by-id', {params: {orderId: orderId}});
            },
            getUserOrderById: function (orderId) {
                return $http.get(startUrl + '/user-order-by-id', {params: {orderId: orderId}});
            },
            getAllOrderStatuses: function () {
                return $http.get(startUrl + '/all-order-statuses');
            }
        };
    }]);