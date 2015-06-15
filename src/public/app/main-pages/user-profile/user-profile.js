/**
 * Просмотр редактирование информации пользователя
 */
angular
    .module('zakaz-xd.user-profile', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.auth-resource'
    ])
    .controller('UserProfileCtrl', ['$scope', '$stateParams', '$state', '$http', 'user', 'AuthResource', 'ErrorDialog',
        function ($scope, $stateParams, $state, $http, user, AuthResource, ErrorDialog) {
            $scope.user = angular.copy(user);
            $scope.save = function() {
                console.log("save user", $scope.user);
            };
            $scope.changePassword  = function() {
                console.log("change user password", $scope.user);
                AuthResource.changePassword($scope.user.newPassword).then(
                    function (response) {
                        // успешное сообщение
                        console.log("success change password");
                    },
                    function (err) {
                        ErrorDialog.open(err, true);
                    }
                );
            };

        }
    ])
;
