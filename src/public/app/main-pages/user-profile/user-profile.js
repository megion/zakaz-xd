/**
 * Просмотр редактирование информации пользователя
 */
angular
    .module('zakaz-xd.user-profile', [
    ])
    .controller('UserProfileCtrl', ['$scope', '$stateParams', '$state', 'user',
        function ($scope, $stateParams, $state, user) {
            $scope.user = angular.copy(user);
            $scope.save = function() {
                console.log("save user", $scope.user);
            };
            $scope.changePassword  = function() {
                console.log("change user password", $scope.user);
            };

        }
    ])
;
