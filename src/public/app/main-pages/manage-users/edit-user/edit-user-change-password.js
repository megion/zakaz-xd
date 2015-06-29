/**
 * Изменение\создание пользователя
 */
angular
    .module('zakaz-xd.manage-users.edit-user.change-password', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.resources.roles-resource',
        'zakaz-xd.auth'
    ])
    .controller('EditUserChangePasswordCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog', 'user',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog, user) {
            $scope.user = user;

            $scope.data = {
                newPassword: null,
                repeatNewPassword: null
            };

            $scope.changePassword  = function(invalid) {
                if (invalid) {
                    return false;
                }

                if ($scope.data.newPassword !== $scope.data.repeatNewPassword) {
                    return ErrorDialog.open({message: 'Пароли не совпадают'}, true);
                }

                var passData = {
                    userId: $scope.user._id,
                    newPassword: $scope.data.newPassword,
                    repeatNewPassword: $scope.data.repeatNewPassword
                };

                UsersResource.changePassword(passData).then(
                    function (response) {
                        InfoDialog.open('Пароль пользователя успешно изменен', 'Изменение пароля');
                        $state.go("users-list");
                    },
                    function (err) {
                        ErrorDialog.open(err, true);
                    }
                );
            };
        }
    ])
;
