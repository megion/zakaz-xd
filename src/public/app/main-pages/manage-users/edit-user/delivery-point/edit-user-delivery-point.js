/**
 * Изменение\создание точки доставки пользователя
 */
angular
    .module('zakaz-xd.manage-users.edit-user.delivery-point', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.auth'
    ])
    .controller('EditUserDeliveryPointCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'user', 'deliveryPoint',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, user, deliveryPoint) {
            $scope.isCreate = !(deliveryPoint._id);
            $scope.user = user;
            $scope.deliveryPoint = deliveryPoint;

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    UsersResource.addUserDeliveryPoint($scope.user._id, $scope.deliveryPoint).then(
                        function (response) {
                            InfoDialog.open("Точка доставки добавлена");
                            $state.go("edit-user", {id: $scope.user._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                } else {
                    UsersResource.updateUserDeliveryPoint($scope.user._id, $scope.deliveryPoint).then(
                        function (response) {
                            InfoDialog.open("Изменение точки доставки успешно");
                            $state.go("edit-user", {id: $scope.user._id});
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                }
            };

            $scope.delete = function() {
                YesNoDialog.open("Вы действительно хотите удалить точку доставки?").then(
                    function() {
                        UsersResource.removeUserDeliveryPoint($scope.user._id, $scope.deliveryPoint._id).then(
                            function (response) {
                                InfoDialog.open("Точка доставки удалена");
                                $state.go("edit-user", {id: $scope.user._id});
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
