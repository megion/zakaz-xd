/**
 * Изменение\создание пользователя
 */
angular
    .module('zakaz-xd.manage-users.edit-user', [
        'zakaz-xd.dialogs',
        'zakaz-xd.pagination',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.resources.roles-resource',
        'zakaz-xd.auth'
    ])
    .controller('EditUserCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog', 'user', 'allRoles',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog, user, allRoles) {
            $scope.isCreate = !(user._id);
            $scope.allRoles = allRoles;
            $scope.user = user;
            if (!$scope.user.roles) {
                $scope.user.roles = [];
            }

            function setCheckedUserRoles(allRoles, user){
                if (!user.roles) {
                    return;
                }
                var allRolesMap = {};
                for (var i=0; i<allRoles.length; i++) {
                    var role = allRoles[i];
                    allRolesMap[role._id] = role;
                }
                for (var j=0; j<user.roles.length; j++) {
                    var userRole = user.roles[j];
                    if (allRolesMap[userRole._id]) {
                        allRolesMap[userRole._id].checked = true;
                    }
                }
            }
            setCheckedUserRoles(allRoles, user);

            function addCheckedRolesToUser(allRoles, user) {
                var userRolesMap = {};
                if (user.roles && user.roles.length>0) {
                    for (var i=0; i<user.roles.length; i++) {
                        var role = user.roles[i];
                        userRolesMap[role._id] = role;
                    }
                }

                for (var j=0; j<allRoles.length; j++) {
                    var role = allRoles[j];
                    if (role.checked) {
                        if(!userRolesMap[role._id]) {
                            // у пользователя нет этой роли - добавляем
                            user.roles.push(role);
                        }
                    }
                }
            }

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                addCheckedRolesToUser($scope.allRoles, $scope.user);
                console.log("user", $scope.user);
                if ($scope.isCreate) {
                    UsersResource.createUser($scope.user).then(
                        function (response) {
                            $state.go("users-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                } else {
                    UsersResource.editUser($scope.user).then(
                        function (response) {
                            $state.go("users-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                }
            };

            $scope.lockUser = function() {

            };
            $scope.deleteUser = function() {

            };
        }
    ])
;
