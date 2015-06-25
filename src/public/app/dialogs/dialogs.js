angular.module('zakaz-xd.dialogs', [
    'ui.bootstrap'
])

    .factory('ErrorDialog', ['$q', '$modal', '$sce', function ($q, $modal) {
        return {
            open: function (error, printStack) {
                //$scope.errorMsg = $sce.trustAsHtml(err.data);
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    size: 'lg',
                    templateUrl: 'app/dialogs/error-dialog.tpl.html',
                    resolve: {
                    },
                    controller: function ($scope, $modalInstance) {
                        $scope.error = error;
                        $scope.printStack = printStack;
                        $scope.close = function () {
                            $modalInstance.close();
                        };
                    }
                });
            }
        };
    }])
    .factory('InfoDialog', ['$q', '$modal', '$sce', function ($q, $modal, $sce) {
        return {
            open: function (title, message) {
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    size: 'lg',
                    templateUrl: 'app/dialogs/info-dialog.tpl.html',
                    resolve: {
                    },
                    controller: function ($scope, $modalInstance) {
                        $scope.message = $sce.trustAsHtml(message);
                        $scope.title = title;
                        $scope.close = function () {
                            $modalInstance.close();
                        };
                    }
                });
            }
        };
    }])
    .factory('ErrorHandler', ['ErrorDialog', function (ErrorDialog) {
        return {
            handle: function (err) {
                ErrorDialog.open(err.data, true);
            }
        };
    }]);