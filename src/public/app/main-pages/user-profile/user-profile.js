/**
 * Просмотр редактирование информации пользователя
 */
angular
    .module('zakaz-xd.user-profile', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.auth-resource',
        'zakaz-xd.auth'
    ])
    .controller('UserProfileCtrl', ['$scope', '$stateParams', '$state', '$http', 'user', 'AuthResource',
        'ErrorDialog', 'InfoDialog', 'AuthService',
        function ($scope, $stateParams, $state, $http, user, AuthResource,
                  ErrorDialog, InfoDialog, AuthService) {
            $scope.user = angular.copy(user);
            $scope.data = {
                newPassword: null,
                repeatNewPassword: null
            };
            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                AuthResource.saveUser($scope.user).then(
                    function (response) {
                        AuthService.reloadCurrentUser().then(
                            function(savedUser) {
                                $scope.user = angular.copy(savedUser);
                                InfoDialog.open('Успешное сохранение изменений', 'Сохранение изменений');
                            },
                            function (err) {
                                ErrorDialog.open(err, true);
                            }
                        );
                    },
                    function (err) {
                        ErrorDialog.open(err, true);
                    }
                );
            };
            $scope.changePassword  = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.data.newPassword !== $scope.data.repeatNewPassword) {
                    return ErrorDialog.open({message: 'Пароли не совпадают'}, true);
                }

                AuthResource.changePassword($scope.data.newPassword, $scope.data.repeatNewPassword).then(
                    function (response) {
                        InfoDialog.open('Ваш пароль успешно <span style="color: blue;"> изменен <span>', 'Изменение пароля');
                    },
                    function (err) {
                        ErrorDialog.open(err, true);
                    }
                );
            };

        }
    ])
;
