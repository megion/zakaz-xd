/**
 * Изменение\создание привязки пользователя к продукту
 */
angular
    .module('zakaz-xd.user-products.edit-user-product', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.user-products-resource',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.auth',
        'ui.select',
        'ngSanitize'
    ])
    .controller('EditUserProductCtrl', ['$scope', '$stateParams', '$state', 'UserProductsResource', 'UsersResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'userProduct',
        function ($scope, $stateParams, $state, UserProductsResource, UsersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, userProduct) {
            $scope.isCreate = !(userProduct._id);
            $scope.userProduct = userProduct;

            UsersResource.getAllUsers().then(
                function(response) {
                    $scope.allUserList = response.data;
                },
                function(err) {
                    ErrorDialog.open(err.data);
                }
            );

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    UserProductsResource.createUserProduct($scope.userProduct).then(
                        function (response) {
                            InfoDialog.open("Связь товара с пользователем успешно создана");
                            $state.go("product-users-list", {id: $scope.userProduct.product._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                } else {
                    UserProductsResource.editUserProduct($scope.userProduct).then(
                        function (response) {
                            InfoDialog.open("Изменение связи товара с пользователем успешно");
                            $state.go("product-users-list", {id: $scope.userProduct.product._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data);
                        }
                    );
                }
            };

            $scope.delete = function() {
                YesNoDialog.open("Вы действительно хотите удалить связь продукта и пользователя?").then(
                    function() {
                        UserProductsResource.deleteUserProduct($scope.userProduct._id).then(
                            function (response) {
                                InfoDialog.open("Связь с пользователем удалена");
                                $state.go("product-users-list", {id: $scope.userProduct.product._id});
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };
        }
    ])
;
