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
                    console.log("parser val:", value);
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
                    console.log("parser return val:", value);
                    return value;
                }
                function formatter(value) {
                    console.log("formatter val:", value);
                    scope.prevAppliedValue = value;
                    return value;
                }

                ngModel.$formatters.push(formatter);
                ngModel.$parsers.push(banZero);
            }
        };
    })
    .directive('russianOnly', function () {
        // allow only russian letter characters
        var isValid = function (s) {
            return s && s.length > 0;
        };
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }

                function filterRussianOnly(value) {
                    if (value) {
                        var withoutLatin = value.replace(/[^А-Яа-я]/g, '');
                        
                        // store cursor position - will be set by $render function
                        ngModel.hscCursorPosition = element.get(0).selectionStart + 
                            ((withoutLatin.length || 0) - (value.length || 0));

                        if (element.context.required) {
                            ngModel.$setValidity('required', isValid(withoutLatin));
                        }

                        // to eliminate an infinite loop calling parsers (setViewValue call all model parsers)
                        //if (withoutLatin === value) {
                            //return value;
                        //}
                        ngModel.$viewValue = withoutLatin;
                        //ngModel.$setViewValue(withoutLatin);
                        ngModel.$render();
                        return withoutLatin;
                    }
                    return value;
                }

                ngModel.$parsers.unshift(filterRussianOnly);
                //ngModel.$formatters.unshift(function (modelValue) {
                    //if (modelValue) {
                        //var withoutLatin = modelValue.replace(/[^А-Яа-я]/g, '');

                        //// store cursor position
                        //ngModel.hscCursorPosition = element.get(0).selectionStart + ((withoutLatin.length || 0) - (modelValue.length || 0));

                        //if (element.context.required) {
                            //ngModel.$setValidity('required', isValid(withoutLatin));
                        //}
                        //ngModel.$viewValue = withoutLatin;
                        //ngModel.$render();

                        //return withoutLatin;
                    //}
                //});
                ngModel.$render = function () {
                    var elemAsNode = element.get(0);
                    element.val(ngModel.$viewValue);
                    // restore cursor position
                    if (ngModel.hscCursorPosition >= 0 && elemAsNode) {
                        elemAsNode.selectionStart = elemAsNode.selectionEnd = ngModel.hscCursorPosition;
                    }
                };
            }
        };
    })
;
