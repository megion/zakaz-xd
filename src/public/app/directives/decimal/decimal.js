angular.module('zakaz-xd.directives.decimal', [
    'ui.bootstrap',
    'ngSanitize'
])
    .directive('lowercase', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attr, ngModel) {
                function fromUser(text) {
                    console.log('fromUser', text);
                    return (text || '').toUpperCase();
                }

                function toUser(text) {
                    console.log('toUser', text);
                    return (text || '').toLowerCase();
                }
                ngModel.$parsers.push(fromUser);
                ngModel.$formatters.push(toUser);
            }
        };
    })
;