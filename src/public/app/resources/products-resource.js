angular.module('zakaz-xd.resources.products-resource', [
])

    .factory('ProductsResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/products';
        return {
            createProduct: function (newProduct) {
                return $http.post(startUrl + '/create-product', {product: newProduct});
            },
            editProduct: function (product) {
                return $http.post(startUrl + '/edit-product', {product: product});
            },
            deleteProduct: function (id) {
                return $http.post(startUrl + '/delete-product', {id: id});
            },
            getAllProducts: function (page) {
                return $http.get(startUrl + '/all-products', {params: page});
            },
            getProductById: function (id) {
                return $http.get(startUrl + '/product-by-id', {params: {id: id}});
            },
            getAllMeasureUnits: function () {
                return $http.get(startUrl + '/all-measure-units');
            }
        };
    }]);