angular.module('zakaz-xd.resources.auth-resource', [
])

    .factory('AuthResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/auth';
        return {
            changePassword: function (newPassword, repeatNewPassword) {
                return $http.post(startUrl + '/change-password',
                    {newPassword: newPassword, repeatNewPassword: repeatNewPassword});
            },
            saveUser: function (user) {
                return $http.post(startUrl + '/save-user', {user: user});
            },
            getCurrentUser: function () {
                return $http.get(startUrl + '/current-user', { headers: {'If-Modified-Since': '0'}});
            },
            login: function(username, password) {
                var config = {
                    ignoreAuthInterceptor: true
                };
                return $http.post(startUrl + '/login', {username: username, password: password}, config);
            },
            logout: function() {
                return $http.post(startUrl + '/logout', {});
            },
            isAuthenticated: function() {
                return $http.get(startUrl + '/is-authenticated');
            }
        };
    }]);