/**
 * Изменение\создание точки доставки пользователя
 */
angular
    .module('zakaz-xd.manage-users.edit-user.delivery-point', [
        'zakaz-xd.dialogs',
        'zakaz-xd.resources.users-resource',
        'zakaz-xd.auth'
    ])
    .controller('EditUserDeliveryPointCtrl', ['$scope', '$stateParams', '$state', 'UsersResource',
        'ErrorDialog', 'InfoDialog', 'YesNoDialog', 'user', 'allRoles',
        function ($scope, $stateParams, $state, UsersResource,
                  ErrorDialog, InfoDialog, YesNoDialog, user, allRoles) {
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
                var newUserRoles = [];
                for (var j=0; j<allRoles.length; j++) {
                    var role = allRoles[j];
                    if (role.checked) {
                        newUserRoles.push(role);
                    }
                }
                // просто заменяем роли
                user.roles = newUserRoles;
            }

            $scope.save = function(invalid) {
                if (invalid) {
                    return false;
                }

                addCheckedRolesToUser($scope.allRoles, $scope.user);
                if ($scope.isCreate) {
                    UsersResource.createUser($scope.user).then(
                        function (response) {
                            InfoDialog.open("Пользователь успешно добавлен");
                            $state.go("users-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                } else {
                    UsersResource.editUser($scope.user).then(
                        function (response) {
                            InfoDialog.open("Пользователь успешно сохранен");
                            $state.go("users-list");
                        },
                        function (err) {
                            ErrorDialog.open(err.data, true);
                        }
                    );
                }
            };

            $scope.lockUser = function() {
                YesNoDialog.open("Вы действительно хотите заблокировать пользователя?").then(
                    function() {
                        UsersResource.lockUser($scope.user._id).then(
                            function (response) {
                                InfoDialog.open("Пользователь заблокирован");
                                $state.go("edit-user", {id: $scope.user._id}, {reload: true});
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };
            $scope.unlockUser = function() {
                YesNoDialog.open("Вы действительно хотите разблокировать пользователя?").then(
                    function() {
                        UsersResource.unlockUser($scope.user._id).then(
                            function (response) {
                                InfoDialog.open("Пользователь разблокирован");
                                $state.go("edit-user", {id: $scope.user._id}, {reload: true});
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };
            $scope.deleteUser = function() {
                YesNoDialog.open("Вы действительно хотите удалить пользователя?").then(
                    function() {
                        UsersResource.deleteUser($scope.user._id).then(
                            function (response) {
                                InfoDialog.open("Пользователь удален");
                                $state.go("users-list");
                            },
                            function (err) {
                                ErrorDialog.open(err.data, true);
                            }
                        );
                    }
                );
            };
        }
    ])
;
