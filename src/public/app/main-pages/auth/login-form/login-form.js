angular
    .module('zakaz-xd.auth.login-form', [
        'zakaz-xd.auth',
        'zakaz-xd.dialogs'
    ])
    .controller('LoginFormCtrl', ['$scope', '$stateParams', '$state', 'AuthService', 'ErrorDialog',
        function ($scope, $stateParams, $state, AuthService, ErrorDialog) {

            $scope.credentials = {
                username: null,
                password: null,
                rememberMe: null
            };
            $scope.login = function(invalid) {
                if (invalid) {
                    return false;
                }

                AuthService.login($scope.credentials.username, $scope.credentials.password).then(
                    function() {
                        $scope.errorMsg = null;
                        $state.go('order-list');
                    },
                    function(err) {
                        ErrorDialog.open(err.data);
                    }
                );
            };
        }
    ])
;
