angular.module('zakaz-xd.resources.users-resource', [
])

    .factory('UsersResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/users';
        return {
            createUser: function (newUser) {
                return $http.post(startUrl + '/create-user', {user: newUser});
            },
            editUser: function (user) {
                return $http.post(startUrl + '/edit-user', {user: user});
            },
            changePassword: function (passData) {
                return $http.post(startUrl + '/change-password', passData);
            },
            deleteUser: function (userId) {
                return $http.post(startUrl + '/delete-user', {userId: userId});
            },
            lockUser: function (userId) {
                return $http.post(startUrl + '/lock-user', {userId: userId});
            },
            unlockUser: function (userId) {
                return $http.post(startUrl + '/unlock-user', {userId: userId});
            },
            getAllUsers: function (page) {
                return $http.get(startUrl + '/all-users', {params: page});
            },
            getUserById: function (userId) {
                return $http.get(startUrl + '/user-by-id', {params: {userId: userId}});
            }
        };
    }]);