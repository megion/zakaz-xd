angular.module('zakaz-xd.resources.roles-resource', [
])

    .factory('RolesResource', ['$q', '$http', function ($q, $http) {
        var startUrl='/roles';
        return {
            getAllRoles: function () {
                return $http.get(startUrl + '/all-roles');
            }
        };
    }]);