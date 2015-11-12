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
                        if ($scope.error.status && $scope.error.status === 400) {
                            // стек не печатем т.к. это ошибка валидации или логики
                            $scope.printStack = false;
                        }
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
            open: function (message, title) {
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
    .factory('YesNoDialog', ['$q', '$modal', '$sce', function ($q, $modal, $sce) {
        return {
            open: function (message, title) {
                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    size: 'lg',
                    templateUrl: 'app/dialogs/yes-no-dialog.tpl.html',
                    resolve: {
                    },
                    controller: function ($scope, $modalInstance) {
                        $scope.message = $sce.trustAsHtml(message);
                        $scope.title = title;
                        $scope.close = function () {
                            $scope.$dismiss("NO");
                        };
                        $scope.yes = function () {
                            $scope.$close("YES");
                        };
                        $scope.no = function () {
                            $scope.$dismiss("NO");
                        };
                    }
                });
                return modalInstance.result;
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