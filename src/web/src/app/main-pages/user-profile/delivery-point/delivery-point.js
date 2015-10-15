/**
 * Изменение\создание точки доставки пользователя
 */
angular
    .module('zakaz-xd.user-profile.delivery-point', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.auth'
    ])
    .controller('UserProfileDeliveryPointCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'user', 'deliveryPoint', 'AuthService',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, user, deliveryPoint, AuthService) {
            $scope.isCreate = !(deliveryPoint._id);
            $scope.user = user;
            $scope.deliveryPoint = deliveryPoint;

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.isCreate) {
                    UsersResource.addCurrentUserDeliveryPoint($scope.deliveryPoint).then(
                        function (response) {
                            InfoDialog.open("Точка доставки добавлена");
                            AuthService.reloadCurrentUser();
                            $state.go("user-profile");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                } else {
                    UsersResource.updateCurrentUserDeliveryPoint($scope.deliveryPoint).then(
                        function (response) {
                            InfoDialog.open("Изменение точки доставки успешно");
                            $state.go("user-profile", {id: $scope.user._id});
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
                        UsersResource.removeCurrentUserDeliveryPoint($scope.deliveryPoint._id).then(
                            function (response) {
                                InfoDialog.open("Точка доставки удалена");
                                AuthService.reloadCurrentUser();
                                $state.go("user-profile");
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
