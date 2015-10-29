angular.module('zakaz-xd.resources.user-products-resource', [
])

    .factory('UserProductsResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/user-products';
        return {
            getProductUsersByProductId: function (productId, page) {
                return $http.get(startUrl + '/product-users-by-product-id', {params: {id: productId, page: page.page, itemsPerPage: page.itemsPerPage}});
            },
            getProductUsersByCurrentUser: function () {
                return $http.get(startUrl + '/product-users-by-current-user', {params: {}});
            },
            createUserProduct: function (newUserProduct) {
                return $http.post(startUrl + '/create-user-product', {userProduct: newUserProduct});
            },
            deleteUserProduct: function (id) {
                return $http.post(startUrl + '/delete-user-product', {id: id});
            },
            editUserProduct: function (userProduct) {
                return $http.post(startUrl + '/edit-user-product', {userProduct: userProduct});
            },
            getUserProductById: function (id) {
                return $http.get(startUrl + '/user-product-by-id', {params: {id: id}});
            }
        };
    }]);