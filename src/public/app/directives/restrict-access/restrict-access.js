angular.module('zakaz-xd.directives.restrict-access', [
    'zakaz-xd.auth'
])
    .directive('restrictAccess',[ 'AuthService', 'ACCESS', function (AuthService, ACCESS) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                function show() {
                    element.removeClass('restrict-access');
                }
                function hide() {
                    element.addClass('restrict-access');
                }

                function getAccessValue(accesses) {
                    var accessValue = null;
                    for (var i=0; i<accesses.length; i++) {
                        var accKey= accesses[i];
                        var accVal = ACCESS[accKey];
                        if (accVal!==null && accVal!==undefined) {
                            if (accessValue) {
                                accessValue = accessValue | accVal;
                            } else {
                                accessValue = accVal;
                            }
                        }
                    }
                    return accessValue;
                }

                var accesses = attrs.restrictAccess.split(",");
                if(accesses.length===0) {
                    return;
                }

                var aValue = getAccessValue(accesses);
                if (aValue===null) {
                    return show();
                }

                AuthService.checkAccess(aValue).then(
                    function() {
                        show();
                    },
                    function() {
                        hide();
                    }
                );



            }
        };
    }])
;