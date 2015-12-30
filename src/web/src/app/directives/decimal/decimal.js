angular.module('zakaz-xd.directives.decimal', [
    'ui.bootstrap',
    'ngSanitize'
])
    .directive('lowercase', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                function fromUser(text) {
                    console.log('fromUser', text);
                    return (text || '').toUpperCase();
                }

                function toUser(text) {
                    console.log('toUser', text);
                    return (text || '').toLowerCase();
                }

                //ngModel.$parsers.push(fromUser);
                //ngModel.$formatters.push(toUser);

                function formatter(value) {
                    console.log('formatter', value);
                    if (value) {
                        return value.toUpperCase();
                    }
                }

                ngModel.$formatters.push(formatter);
            }
        };
    })
    .directive('banEnterZero', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModel) {
                function banZero(value) {
                    if (!scope.prevAppliedValue) {
                        scope.prevAppliedValue = value;
                        return value;
                    }

                    var oldValue = scope.prevAppliedValue;

                    // новое значение не пустое и старое значение не пустое
                    if (value!==null && value!==undefined && oldValue!==null && oldValue!==undefined) {
                        var numValue = parseFloat(value);
                        // проверить новое значение: если оно не пустое и является числом при этом = 0 то установить
                        // старое значение.
                        if (numValue!=null && numValue===0) {
                            // дополнительная проверка: если старое значение было 0, тогда можно ввести любое значение
                            var numOldValue = parseFloat(oldValue);
                            if (!(numOldValue != null && numOldValue===0)) {
                                ngModel.$setViewValue(oldValue);
                                ngModel.$render();
                                return oldValue;
                            }
                        }
                    }

                    scope.prevAppliedValue = value;
                    return value;
                }
                function formatter(value) {
                    scope.prevAppliedValue = value;
                    return value;
                }

                ngModel.$formatters.push(formatter);
                ngModel.$parsers.push(banZero);
            }
        };
    })
;