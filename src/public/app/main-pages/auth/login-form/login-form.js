angular
    .module('zakaz-xd.auth.login-form', [
        'zakaz-xd.auth',
    ])
    .controller('LoginFormCtrl', ['$scope', '$stateParams', '$state', '$sce', 'AuthService',
        function ($scope, $stateParams, $state, $sce, AuthService) {

            $scope.credentials = {
                username: null,
                password: null,
                rememberMe: null
            };
            $scope.login = function() {
                AuthService.login($scope.credentials.username, $scope.credentials.password).then(
                    function() {
                        $scope.errorMsg = null;
                        $state.go('order-list');
                    },
                    function(err) {
                        if (err.status===403 || err.status===404) {
                            $scope.errorMsg = $sce.trustAsHtml(err.data);
                        } else {
                            console.error("Login error", err);
                        }

                    }
                );
            };
        }
    ])
;
