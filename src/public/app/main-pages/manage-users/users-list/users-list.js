/**
 * Список пользователей
 */
angular
    .module('zakaz-xd.manage-users.users-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.pagination',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.auth'
    ])
    .controller('UsersListCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog) {

            $scope.userList = [];
            $scope.pageConfig = {
                total: 66,
                page: 1,
                itemsPerPage: 10,
                pageChanged: function(page, itemsPerPage)  {
                    console.log("page", {page: page, itemsPerPage: itemsPerPage});
                }
            };

            function refreshUsersTable(page) {
                UsersResource.getAllUsers(page).then(
                    function(response) {
                        $scope.userList = response.data.items;
                        $scope.pageConfig.total = response.data.total;
                    }
                );
            }

            refreshUsersTable({page: $scope.pageConfig.page, itemsPerPage: $scope.pageConfig.itemsPerPage});
        }
    ])
;
