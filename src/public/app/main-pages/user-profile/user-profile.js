/**
 * Просмотр редактирование информации пользователя
 */
angular
    .module('zakaz-xd.user-profile', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.auth-resource'
    ])
    .controller('UserProfileCtrl', ['$scope', '$stateParams', '$state', '$http', 'user', 'AuthResource',
        'ErrorDialog', 'InfoDialog',
        function ($scope, $stateParams, $state, $http, user, AuthResource,
                  ErrorDialog, InfoDialog) {
            $scope.user = user;
            $scope.data = {
                newPassword: null,
                repeatNewPassword: null
            };
            $scope.save = function() {
                console.log("save user", $scope.user);
            };
            $scope.changePassword  = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.data.newPassword !== $scope.data.repeatNewPassword) {
                    return ErrorDialog.open({data: {message: 'Пароли не совпадают'}}, true);
                }

                AuthResource.changePassword($scope.data.newPassword, $scope.data.repeatNewPassword).then(
                    function (response) {
                        InfoDialog.open('Изменение пароля', 'Ваш пароль успешно <span style="color: blue;"> изменен <span>');
                    },
                    function (err) {
                        ErrorDialog.open(err, true);
                    }
                );
            };

        }
    ])
;
