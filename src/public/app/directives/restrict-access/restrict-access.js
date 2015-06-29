angular.module('zakaz-xd.directives.restrict-access', [
    'zakaz-xd.auth'
])
    .directive('restrictAccess',[ 'AuthService', 'ACCESS', function (AuthService, ACCESS) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                function show() {
                    element.removeClass('restrictAccess');
                }
                function hide() {
                    element.addClass('restrictAccess');
                }

                var accesses = attrs.restrictAccess.split(",");

                //AuthService.checkAccess(ACCESS.MANAGE_USERS)

            }
        };
    }])
;