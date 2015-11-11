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
                return $http.post(startUrl + '/delete-order', {id: orderId});
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
            getAllOrderStatuses: function () {
                return $http.get(startUrl + '/all-order-statuses');
            },

            // order product
            addOrderProduct: function (orderId, orderProduct) {
                return $http.post(startUrl + '/add-order-product', {orderId: orderId, orderProduct: orderProduct});
            },
            updateOrderProduct: function (orderId, orderProduct) {
                return $http.post(startUrl + '/update-order-product', {orderId: orderId, orderProduct: orderProduct});
            },
            removeOrderProduct: function (orderId, orderProductId) {
                return $http.post(startUrl + '/remove-order-product', {orderId: orderId, orderProductId: orderProductId});
            },
            removeAllOrderProducts: function (orderId) {
                return $http.post(startUrl + '/remove-all-order-products', {orderId: orderId});
            },

            // change statuses
            activateOrder: function (orderId) {
                return $http.post(startUrl + '/activate-order', {orderId: orderId});
            },
            approveOrder: function (orderId) {
                return $http.post(startUrl + '/approve-order', {orderId: orderId});
            },
            shipOrder: function (orderId) {
                return $http.post(startUrl + '/ship-order', {orderId: orderId});
            },
            closeOrder: function (orderId) {
                return $http.post(startUrl + '/close-order', {orderId: orderId});
            },

            // comment
            addOrderComment: function (orderId, comment) {
                return $http.post(startUrl + '/add-order-comment', {orderId: orderId, comment: comment});
            },
            updateOrderComment: function (orderId, comment) {
                return $http.post(startUrl + '/update-order-comment', {orderId: orderId, comment: comment});
            },
            removeOrderComment: function (orderId, orderCommentId) {
                return $http.post(startUrl + '/remove-order-comment', {orderId: orderId, orderCommentId: orderCommentId});
            }
        };
    }]);