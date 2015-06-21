/**
 * Список пользователей
 */
angular
    .module('zakaz-xd.manage-users.users-list', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.auth'
    ])
    .controller('UsersListCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog) {

        }
    ])
;
