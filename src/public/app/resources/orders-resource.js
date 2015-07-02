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
            getUserOrders: function (userId, page) {
                return $http.get(startUrl + '/user-orders', {params: {page: page, userId: userId}});
            },
            getOrderById: function (orderId) {
                return $http.get(startUrl + '/order-by-id', {params: {orderId: orderId}});
            },
            getAllOrderStatuses: function () {
                return $http.get(startUrl + '/all-order-statuses');
            },
            getAllOrderTypes: function () {
                return $http.get(startUrl + '/all-order-types');
            }
        };
    }]);