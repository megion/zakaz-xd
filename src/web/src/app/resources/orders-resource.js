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
            editCurrentUserOrder: function (order) {
                return $http.post(startUrl + '/edit-user-order', {order: order});
            },
            deleteOrder: function (orderId) {
                return $http.post(startUrl + '/delete-order', {id: orderId});
            },
            deleteCurrentUserOrder: function (orderId) {
                return $http.post(startUrl + '/delete-user-order', {id: orderId});
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
            },

            // order product
            addOrderProduct: function (orderId, orderProduct) {
                return $http.post(startUrl + '/add-order-product', {orderId: orderId, orderProduct: orderProduct});
            },
            addCurrentUserOrderProduct: function (orderId, orderProduct) {
                return $http.post(startUrl + '/add-user-order-product', {orderId: orderId, orderProduct: orderProduct});
            }
        };
    }]);