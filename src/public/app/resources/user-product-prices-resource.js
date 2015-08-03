angular.module('zakaz-xd.resources.user-product-prices-resource', [
])

    .factory('UserProductPricesResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/user-product-prices';
        return {
            getProductUserPricesByUserProductId: function (userProductId, page) {
                return $http.get(startUrl + '/user-product-prices-by-user-product-id', {params: {id: userProductId, page: page.page, itemsPerPage: page.itemsPerPage}});
            },
            createUserProductPrice: function (newUserProductPrice) {
                return $http.post(startUrl + '/create-user-product-price', {userProductPrice: newUserProductPrice});
            },
            deleteUserProductPrice: function (id) {
                return $http.post(startUrl + '/delete-user-product-price', {id: id});
            },
            editUserProductPrice: function (userProductPrice) {
                return $http.post(startUrl + '/edit-user-product-price', {userProductPrice: userProductPrice});
            },
            getUserProductPriceById: function (id) {
                return $http.get(startUrl + '/user-product-price-by-id', {params: {id: id}});
            }
        };
    }]);