angular.module('zakaz-xd.resources.auth-resource', [
])

    .factory('AuthResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/auth';
        return {
            changePassword: function (newPassword) {
                return $http.post(startUrl + '/changePassword', {newPassword: newPassword});
            }
        };
    }]);