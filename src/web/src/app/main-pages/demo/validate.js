angular
    .module('common.validate', [
        'lodash',
        'common.validate2',
        'common.decimal-number-service'
    ])
    .directive('decimal', ['decimalNumberService', 'DECIMAL_CONST', function (decimalNumberService, DECIMAL_CONST) {
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                var DEFAULT_FRACTION = 2;
                var fraction = scope.$eval(attrs['decimal']);
                var negative = scope.$eval(attrs['negative']);
                var maxValue = parseFloat(scope.$eval(attrs['decimalMax']));

                // Опция автодополнения путой дробной части нулями
                var fractionAutocomplete = scope.$eval(attrs['fractionAutocomplete']);
                if (fractionAutocomplete === undefined) {
                    fractionAutocomplete = true;
                }

                var delimiter = '.';
                var delimiterToReplace = ',';
                var minus = '-';
                var symbolsAfterDelimiter = fraction || fraction === 0 ? fraction : DEFAULT_FRACTION;
                // автодополнение нулями ограниченно DECIMAL_CONST.MAX_AUTOCOMPLETE_ZERO_NUMBER
                var autocompleteZeroNumber = symbolsAfterDelimiter>DECIMAL_CONST.MAX_AUTOCOMPLETE_ZERO_NUMBER ?
                    DECIMAL_CONST.MAX_AUTOCOMPLETE_ZERO_NUMBER : symbolsAfterDelimiter;
                var hasDelimiter = false;
                var hasMinus = false;

                var disableCutExtraZeros = attrs.hasOwnProperty('disableCutExtraZeros');
                var enableCutSingleMinus = attrs.hasOwnProperty('enableCutSingleMinus');

                // Если введенное число оканчивается разделителем, то дополнить число нулями после разделителя
                element.on('blur.decimal', function () {
                    var newValue;
                    if (disableCutExtraZeros) {
                        if (ngModel.$viewValue) {
                            newValue = ngModel.$viewValue.toString();
                        } else {
                            newValue = ngModel.$viewValue;
                        }
                    } else {
                        newValue = decimalNumberService.cutExtraZeros(ngModel.$viewValue, autocompleteZeroNumber);
                    }
                    if (fractionAutocomplete && hasDelimiter) {
                        newValue = decimalNumberService.autocompleteFraction(newValue, autocompleteZeroNumber);
                    }
                    // включена опция удаления '-' если значение '-' или '-0.00'
                    if (enableCutSingleMinus && newValue) {
                        if (newValue === '-0.00') {
                            newValue = "0.00";
                        } else if (newValue === '-') {
                            newValue = "";
                        }
                    }
                    if (newValue !== ngModel.$viewValue) {
                        ngModel.$setViewValue(newValue);
                        ngModel.$render();
                    }
                });
                scope.$on('$destroy',function () {
                    element.off('blur.decimal');
                });

                ngModel.$parsers.unshift(function (inputValue) {
                    hasDelimiter = false;
                    hasMinus = false;
                    if (!inputValue) {
                        return inputValue;
                    }
                    inputValue = '' + inputValue;
                    inputValue = inputValue.replace(delimiterToReplace, delimiter);
                    var digits = inputValue.split('').filter(function (s) {
                        if (s === delimiter && !hasDelimiter && inputValue.indexOf(s) !== 0) {
                            hasDelimiter = true;
                            return true;
                        } else if (negative && s === minus && !hasMinus && inputValue.indexOf(s) === 0) {
                            hasMinus = true;
                            return true;
                        } else {
                            return (!isNaN(s) && s != ' ');
                        }
                    }).join('');

                    var numberOfSymbolsToCutOff = digits.length - (digits.indexOf(delimiter) + symbolsAfterDelimiter + 1);
                    var exceededSymbolsAfterDelimiter = digits.indexOf(delimiter) > 0 && numberOfSymbolsToCutOff > 0;
                    if (exceededSymbolsAfterDelimiter) {
                        digits = digits.slice(0, -(numberOfSymbolsToCutOff));
                    }

                    if (!isNaN(maxValue) && parseFloat(digits) > maxValue) {
                        digits = maxValue.toFixed(fraction);
                    }

                    if (ngModel.$viewValue != digits) {
                        ngModel.$setViewValue(digits);
                        ngModel.$render();
                    }
                    return digits;
                });
            }
        };
    }])
    /**
     * В отличие от директивы decimal, есть ограничение по кол-ву символов в целой части
     */
    .directive('decimal2',['$compile', 'decimalNumberService', 'DECIMAL_CONST',
        function ($compile, decimalNumberService, DECIMAL_CONST) {
            return {
                priority: 1,
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, element, attrs, ngModel) {
                    if (!ngModel) {
                        return;
                    }
                    var DEFAULT_FRACTION = 2;
                    var fraction = scope.$eval(attrs['decimal']);
                    var negative = scope.$eval(attrs['negative']);
                    var maxSymbolsBeforeDelimiter = scope.$eval(attrs['fractal']);
                    var maxValue = parseFloat(scope.$eval(attrs['decimalMax']));
                    var minValue = parseFloat(scope.$eval(attrs['decimalMin']));

                    // Опция автодополнения путой дробной части нулями
                    var fractionAutocomplete = scope.$eval(attrs['fractionAutocomplete']);
                    if (fractionAutocomplete === undefined) {
                        fractionAutocomplete = true;
                    }

                    var delimiter = '.';
                    var delimiterToReplace = ',';
                    var minus = '-';
                    var symbolsAfterDelimiter = fraction || fraction === 0 ? fraction : DEFAULT_FRACTION;
                    // автодополнение нулями ограниченно DECIMAL_CONST.MAX_AUTOCOMPLETE_ZERO_NUMBER
                    var autocompleteZeroNumber = symbolsAfterDelimiter > DECIMAL_CONST.MAX_AUTOCOMPLETE_ZERO_NUMBER ?
                        DECIMAL_CONST.MAX_AUTOCOMPLETE_ZERO_NUMBER : symbolsAfterDelimiter;

                    var hasDelimiter = false;
                    var hasMinus = false;

                    //после установки данного параметра при невалидных decimalMin, decimalMax их значения не будут удаляться -
                    //поле при этом станет невалидным
                    // DEPRECATED: showM-min-max-error не надо использовать. Надо ng-model-options="{allowInvalid: true}"
                    var showMinMaxError = scope.$eval(attrs['showMinMaxError']);
                    if (showMinMaxError) {
                        ngModel.$options = ngModel.$options || {
                            updateOnDefault: true
                        };
                        angular.extend(ngModel.$options, {
                            allowInvalid: true
                        });
                    }

                    var disableCutExtraZeros = attrs.hasOwnProperty('disableCutExtraZeros');
                    var enableCutSingleMinus = attrs.hasOwnProperty('enableCutSingleMinus');

                    function validateDecimalMax(modelValue, viewValue) {
                        if(isNaN(maxValue)) {
                            return true;
                        }
                        var parsed = parseFloat(viewValue);
                        return isNaN(parsed) || parsed <= maxValue;
                    }

                    function validateDecimalMin(modelValue, viewValue) {
                        if(isNaN(minValue)) {
                            return true;
                        }
                        var parsed = parseFloat(viewValue);
                        return isNaN(parsed) || parsed >= minValue;
                    }

                    var formatFn = function () {
                        var newValue;
                        if (disableCutExtraZeros) {
                            if (ngModel.$viewValue) {
                                newValue = ngModel.$viewValue.toString();
                            } else {
                                newValue = ngModel.$viewValue;
                            }
                        } else {
                            newValue = decimalNumberService.cutExtraZeros(ngModel.$viewValue, autocompleteZeroNumber);
                        }
                        if (fractionAutocomplete && hasDelimiter) {
                            newValue = decimalNumberService.autocompleteFraction(newValue, autocompleteZeroNumber);
                        }
                        // включена опция удаления '-' если значение '-' или '-0.00'
                        if (enableCutSingleMinus && newValue) {
                            if (newValue === '-0.00') {
                                newValue = "0.00";
                            } else if (newValue === '-') {
                                newValue = "";
                            }
                        }
                        if(typeof ngModel.$viewValue == 'number'){
                            newValue = parseFloat(newValue);
                        }

                        if(typeof newValue == 'string'){
                            newValue = newValue.replace(delimiterToReplace, delimiter);
                        }

                        ngModel.$setViewValue(newValue);
                        ngModel.$render();
                    };

                    element.on('blur.decimal2', formatFn);

                    scope.$on('$destroy',function () {
                        element.off('blur.decimal2');
                    });

                    ngModel.$formatters.unshift(function (inputValue) {
                        ngModel.$viewValue = inputValue;
                        formatFn();
                        return ngModel.$viewValue;
                    });

                    ngModel.$parsers.unshift(function (inputValue) {
                        hasDelimiter = false;
                        hasMinus = false;
                        if (!inputValue) {
                            if (ngModel.$modelValue === null) {
                                return null;
                            } else if (ngModel.$modelValue === 0) {
                                return 0;
                            } else {
                                return inputValue;
                            }
                        }
                        inputValue = '' + inputValue;
                        inputValue = inputValue.replace(delimiterToReplace, delimiter);
                        var digits = inputValue.split('').filter(function (s) {
                            if (s === delimiter && !hasDelimiter && inputValue.indexOf(s) !== 0) {
                                hasDelimiter = true;
                                return true;
                            } else if (negative && s === minus && !hasMinus && inputValue.indexOf(s) === 0) {
                                hasMinus = true;
                                return true;
                            } else {
                                return (!isNaN(s) && (s != ' ') && (s != '	')); //не удалять второе не пробел, а Tab
                            }
                        }).join('');

                        var numberOfSymbolsToCutOff = digits.length - (digits.indexOf(delimiter) + symbolsAfterDelimiter + 1);
                        var exceededSymbolsAfterDelimiter = digits.indexOf(delimiter) > 0 && numberOfSymbolsToCutOff > 0;
                        if (exceededSymbolsAfterDelimiter) {
                            //Чтобы не разбираться, с какого места редактировали число, просто отображаем предыдущее значение.
                            //Если предыдущего нет (например, "ctrl + V") - отрезаем последние символы. Для целой части чуть ниже делаем то же самое.
                            //HCS-15500
                            // ngModel.$modelValue - может быть целым числом поэтому вызываем toString()
                            digits = ngModel.$modelValue ? ngModel.$modelValue.toString() : digits.slice(0, -(numberOfSymbolsToCutOff));
                        }
                        if (maxSymbolsBeforeDelimiter) {

                            var checkAndShortenFractalPart = function (fractalPart) {
                                numberOfSymbolsToCutOff = fractalPart.length - maxSymbolsBeforeDelimiter;
                                if (numberOfSymbolsToCutOff > 0) {
                                    if(ngModel.$modelValue) {
                                        return ngModel.$modelValue.toString().substr(0, maxSymbolsBeforeDelimiter);
                                    } else {
                                        return fractalPart.substr(0, maxSymbolsBeforeDelimiter);
                                    }
                                }
                                else {
                                    return fractalPart;
                                }
                            };

                            if (hasDelimiter) {
                                var fractalPart = checkAndShortenFractalPart(digits.substring(0, digits.indexOf(delimiter)));
                                digits = fractalPart + digits.substring(digits.indexOf(delimiter), digits.length);
                            } else {
                                digits = checkAndShortenFractalPart(digits);
                            }
                        }

                        if (ngModel.$viewValue != digits) {
                            ngModel.$setViewValue(angular.isNumber(ngModel.$modelValue) ? parseFloat(digits) : digits);
                            ngModel.$render();
                        }

                        digits = angular.isNumber(ngModel.$modelValue) ? parseFloat(digits) : digits;

                        return digits;
                    });

                    ngModel.$validators.decimalMax = validateDecimalMax;
                    ngModel.$validators.decimalMin = validateDecimalMin;
                }
            };
        }
    ])


    .directive('maxPrecision', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (attrs.maxPrecision !== undefined &&  viewValue != null && viewValue.toString().length > 0) {
                        if ((('' + viewValue).split('.')[1] || '').length > parseInt(attrs.maxPrecision, 10)) {
                            ctrl.$setValidity('maxPrecision', false);
                            return viewValue;
                        }
                    }
                    ctrl.$setValidity('maxPrecision', true);
                    return viewValue;
                });
            }
        };
    })

    .directive('minPrecision', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (attrs.minPrecision !== undefined && viewValue != null && viewValue.toString().length > 0) {
                        if ((('' + viewValue).split('.')[1] || '').length < parseInt(attrs.minPrecision, 10)) {
                            ctrl.$setValidity('minPrecision', false);
                            return viewValue;
                        }
                    }
                    ctrl.$setValidity('minPrecision', true);
                    return viewValue;
                });
            }
        };
    })
    .directive('integer', ['decimalNumberService', 'DECIMAL_CONST', function (decimalNumberService, DECIMAL_CONST) {
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                var minValue = parseInt(scope.$eval(attrs['minValue']), 10);
                var maxValue = parseInt(scope.$eval(attrs['maxValue']), 10);

                var enableCutExtraZeros = attrs.hasOwnProperty('cutExtraZeros');

                if (enableCutExtraZeros) {
                    element.on('blur.integer', function () {
                        var newValue = decimalNumberService.cutExtraZeros(ngModel.$viewValue, 2);
                        if (newValue !== ngModel.$viewValue) {
                            ngModel.$setViewValue(newValue);
                            ngModel.$render();
                        }
                    });
                }
                scope.$on('$destroy',function () {
                    element.off('blur.integer');
                });

                ngModel.$parsers.unshift(function (inputValue) {
                    if (inputValue) {
                        inputValue = '' + inputValue;
                        var digits = inputValue.replace(/[^0-9]/g, '');

                        if (!isNaN(minValue) && parseInt(digits, 10) < minValue) {
                            digits = ngModel.$modelValue;
                        }

                        if (!isNaN(maxValue) && parseInt(digits, 10) > maxValue) {
                            digits = ngModel.$modelValue;
                        }

                        if (ngModel.$viewValue != digits) {
                            ngModel.$viewValue = digits;
                            ngModel.$$lastCommittedViewValue = digits; //FIX HCS-82397

                            ngModel.$render();
                        }

                        return digits;
                    }
                    return inputValue;
                });
            }
        };
    }])
    .directive('positiveInt', function () {
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                var removeLeadingZeros = function (str) {
                    return str.replace(/^[0]+/g, '');
                };
                ngModel.$parsers.unshift(function (inputValue) {
                    if (inputValue) {
                        var digits = inputValue.replace(/[^0-9]/g, '');

                        digits = removeLeadingZeros(digits);

                        if (ngModel.$viewValue != digits) {
                            ngModel.$viewValue = digits;
                            ngModel.$render();
                        }

                        return digits;
                    }
                    return inputValue;
                });
            }
        };
    })
    .directive('negativeInt', ['decimalNumberService', function (decimalNumberService) {
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                var minValue = parseInt(scope.$eval(attrs['minValue']), 10);
                var enableCutExtraZeros = attrs.hasOwnProperty('cutExtraZeros');

                if (enableCutExtraZeros) {
                    element.on('blur.integer', function () {
                        var newValue = decimalNumberService.cutExtraZeros(ngModel.$viewValue, 2);
                        if (newValue !== ngModel.$viewValue) {
                            ngModel.$setViewValue(newValue);
                            ngModel.$render();
                        }
                    });
                }
                scope.$on('$destroy',function () {
                    element.off('blur.integer');
                });

                var minus = '-';
                var hasMinus = false;
                ngModel.$parsers.unshift(function (inputValue) {
                    if (inputValue) {
                        inputValue = '' + inputValue;
                        hasMinus = false;
                        var digits = inputValue.split('').filter(function (s) {
                            if (s === minus && !hasMinus && inputValue.indexOf(s) === 0) {
                                hasMinus = true;
                                return true;
                            } else {
                                return (!isNaN(s) && s != ' ');
                            }
                        }).join('');

                        if (!isNaN(minValue) && parseInt(digits, 10) < minValue) {
                            digits = ngModel.$modelValue;
                        }

                        if (ngModel.$viewValue != digits) {
                            ngModel.$viewValue = digits;
                            ngModel.$render();
                        }

                        return digits;
                    }
                    return inputValue;
                });
            }
        };
    }])
    .directive('email', function () {
        /**
         * соответствие формату:
         * 1. <адрес почты>@<доменное имя сервера>.
         * 2. <адрес почты> и <доменное имя сервера>  содержат только буквы латинского алфавита, а также знаки: точка, дефис и нижнее подчеркивание.
         * (из ЧТЗ ППА ЭФ_ППА_ИНФ_АДМ_ОС_ФЗЛ.24)
         */
        function isValidEmail(email) {
            return (/^[0-9A-Za-z\.+\-_]+@[0-9A-Za-z\.\-_]+\.[0-9A-Za-z]+$/).test(email);
        }

        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                ngModel.$parsers.unshift(function (inputValue) {
                    if (inputValue) {
                        ngModel.$setValidity('emailFormat', isValidEmail(inputValue));
                    } else {
                        ngModel.$setValidity('emailFormat', true);
                    }
                    return inputValue;
                });
            }
        };
    })
    .directive('phone', [
        '$log',
        function ($log) {
            var phoneMask = new StringMask('+0 (000) 000-00-00');

            var isValid = function (ctrl, value, disableCheckPhoneFormat) {
                var valid;
                value = clearValue(value);
                if (value && !disableCheckPhoneFormat) {
                    valid = value && value.length == 11;
                    ctrl.$setValidity('phoneFormat', valid);
                } else {
                    ctrl.$setValidity('phoneFormat', true);
                }
                return value;
            };

            var clearValue = function (value) {
                if (!value) {
                    return value;
                }
                return value.replace(/[^0-9]/g, '');
            };

            var applyPhoneMask = function (value) {
                if (!value) {
                    return value;
                }
                var formatedValue = phoneMask.apply(value);
                return formatedValue.trim().replace(/[^0-9]$/, '');
            };

            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, element, attrs, ngModel) {
                    if (!ngModel) {
                        $log.warn('Directive "phone" requires ngModel');
                        return;
                    }
                    var disableCheckPhoneFormat = attrs.hasOwnProperty('disableCheckPhoneFormat');
                    if (!angular.isDefined(attrs.placeholder)) {
                        attrs.$set('placeholder', '+7 (___) ___-__-__');
                    }
                    if (!ngModel) {
                        return;
                    }
                    element.bind('input keyup click focus', function () {
                        var value = clearValue(ngModel.$viewValue);
                        if (!ngModel.$viewValue) {
                            //do nothing
                        } else if (!value) {
                            ngModel.$setViewValue('7');
                        } else if (value && value.charAt(0) != 7) {
                            ngModel.$setViewValue('7' + value);
                        }
                    });

                    ngModel.$parsers.push(function (value) {
                        return isValid(ngModel, value, disableCheckPhoneFormat);
                    });
                    ngModel.$formatters.push(function (value) {
                        return applyPhoneMask(isValid(ngModel, value, disableCheckPhoneFormat));
                    });
                    ngModel.$parsers.push(function (value) {
                        if (!value) {
                            return value;
                        }

                        var cleanValue = clearValue(value);
                        var formatedValue = applyPhoneMask(cleanValue);

                        if (ngModel.$viewValue !== formatedValue) {
                            ngModel.$setViewValue(formatedValue);
                            ngModel.$render();
                        }
                        return clearValue(formatedValue);
                    });
                }
            };
        }
    ])
    .directive('guidmask', [
        function () {
            var guidMask = new StringMask('GGGGGGGG-GGGG-GGGG-GGGG-GGGGGGGGGGGG');

            var isValid = function (ctrl, value, disableCheckGuidFormat) {
                var valid;

                if (value!==undefined) {
                } else {
                    value ="";
                }

                value = clearValue(value);
                if (value && !disableCheckGuidFormat) {
                    valid = value && value.length == 32;
                    ctrl.$setValidity('guidFormat', valid);
                } else {
                    ctrl.$setValidity('guidFormat', true);
                }
                return value;
            };

            var clearValue = function (value) {
                if (!value) {
                    value = "";
                }
                return value.replace(/[^A-Fa-f0-9]/g, '');
            };

            var applyGuidMask = function (value) {
                if (!value) {
                    value = "";
                }
                var formatedValue = guidMask.apply(value);

                if (formatedValue !== undefined) {
                    return formatedValue.trim().replace(/[^A-Fa-f0-9]$/, '');
                } else {
                    return "";
                }
            };

            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, element, attrs, ngModel) {

                    var disableCheckGuidFormat = attrs.hasOwnProperty('disableCheckGuidFormat');
                    if (!angular.isDefined(attrs.placeholder)) {
                        attrs.$set('placeholder', '________-____-____-____-____________');
                    }
                    if (!ngModel) {
                        return;
                    }

                    element.bind('input keyup click focus', function () {
                        var value = clearValue(ngModel.$viewValue);
                        if (!ngModel.$viewValue) {
                            //do nothing
                        } else if (!value) {
                            ngModel.$setViewValue('');
                        }
                    });

                    ngModel.$parsers.push(function (value) {
                        return isValid(ngModel, value, disableCheckGuidFormat);
                    });
                    ngModel.$formatters.push(function (value) {
                        return applyGuidMask(isValid(ngModel, value, disableCheckGuidFormat));
                    });
                    ngModel.$parsers.push(function (value) {
                        if (!value) {
                            value = "";
                        }

                        var cleanValue = clearValue(value);
                        var formatedValue = applyGuidMask(cleanValue);

                        if (ngModel.$viewValue !== formatedValue) {
                            ngModel.$setViewValue(formatedValue);
                            ngModel.$render();
                        }

                        return clearValue(formatedValue);
                    });
                }
            };
        }
    ])
    .directive('timemask', [
        function () {
            var timeMask = new StringMask('00:00');

            var isValid = function (ctrl, value, disableCheckTimeFormat) {
                var valid;

                if (value!==undefined) {
                } else {
                    value ="";
                }

                value = clearValue(value);
                if (value && !disableCheckTimeFormat) {
                    valid = value && value.length == 4;
                    ctrl.$setValidity('timeFormat', valid);
                } else {
                    ctrl.$setValidity('timeFormat', true);
                }
                return value;
            };

            var clearValue = function (value) {
                if (!value) {
                    value = "";
                }

                //убираем все не цифры
                var tmp = value.replace(/[^0-9]/g, '');

                //проверка на формат даты 23-59
                if (tmp.length ==1) {
                    if (tmp>2){
                        tmp = "";
                    }
                } else if (tmp.length ==2) {
                    if (tmp>23){
                        tmp = tmp.substring(0,1);
                    }
                } else if (tmp.length ==3) {
                    var minute = tmp.substring(2,3);
                    if (minute>5){
                        tmp = tmp.substring(0,2);
                    }
                }
                //если уже вводится 4 символ то он может быть любым
                return tmp;
            };

            var applyTimeMask = function (value) {
                if (!value) {
                    value = "";
                }
                var formatedValue = timeMask.apply(value);

                if (formatedValue !== undefined) {
                    return formatedValue.trim().replace(/[^0-9]$/, '');
                } else {
                    return "";
                }
            };

            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, element, attrs, ngModel) {

                    var disableCheckTimeFormat = attrs.hasOwnProperty('disableCheckTimeFormat');
                    if (!angular.isDefined(attrs.placeholder)) {
                        attrs.$set('placeholder', '__:__');
                    }
                    if (!ngModel) {
                        return;
                    }

                    element.bind('input keyup click focus', function () {
                        var value = clearValue(ngModel.$viewValue);
                        if (!ngModel.$viewValue) {
                            //do nothing
                        } else if (!value) {
                            ngModel.$setViewValue('');
                        }
                    });

                    ngModel.$parsers.push(function (value) {
                        return isValid(ngModel, value, disableCheckTimeFormat);
                    });
                    ngModel.$formatters.push(function (value) {
                        return applyTimeMask(isValid(ngModel, value, disableCheckTimeFormat));
                    });
                    ngModel.$parsers.push(function (value) {
                        if (!value) {
                            value = "";
                        }

                        var cleanValue = clearValue(value);
                        var formatedValue = applyTimeMask(cleanValue);

                        if (ngModel.$viewValue !== formatedValue) {
                            ngModel.$setViewValue(formatedValue);
                            ngModel.$render();
                        }

                        return clearValue(formatedValue);
                    });
                }
            };
        }
    ])
    .directive('snils', [
        function () {
            var snilsMask = new StringMask('###-###-### ##');

            var clearValue = function (value) {
                return value ? value.replace(/[^0-9]/g, '').trim().slice(0, 11) : value;
            };

            var applySnilsMask = function (value) {
                return value ? snilsMask.apply(value).replace(/[^0-9]$/, '') : value;
            };

            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, element, attrs, ngModel) {
                    if (!ngModel) {
                        return;
                    }
                    ngModel.$formatters.push(function (value) {
                        return applySnilsMask(clearValue(value));
                    });
                    ngModel.$parsers.push(function (value) {
                        if (!value) {
                            return value;
                        }

                        var cleanValue = clearValue(value);
                        var formattedValue = applySnilsMask(cleanValue);

                        if (ngModel.$viewValue !== formattedValue) {
                            ngModel.$setViewValue(formattedValue);
                            ngModel.$render();
                        }

                        return clearValue(formattedValue);
                    });
                }
            };
        }
    ])
    .directive('russian', function () {
        // disallow enter of english letter characters
        // better name would be 'none-english'
        var isValid = function (s) {
            return !_.isEmpty(s);
        };
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                ngModel.$parsers.unshift(function (inputValue) {
                    if (inputValue) {
                        var withoutLatin = inputValue.replace(/[A-Za-z]/g, '');

                        // store cursor position - will be set by $render function
                        ngModel.hscCursorPosition = element.get(0).selectionStart + ((withoutLatin.length || 0) - (inputValue.length || 0));

                        if (element.context.required) {
                            ngModel.$setValidity('required', isValid(withoutLatin));
                        }
                        ngModel.$viewValue = withoutLatin;
                        ngModel.$render();

                        return withoutLatin;
                    }
                });
                ngModel.$formatters.unshift(function (modelValue) {
                    if (modelValue) {
                        var withoutLatin = modelValue.replace(/[A-Za-z]/g, '');

                        // store cursor position
                        ngModel.hscCursorPosition = element.get(0).selectionStart + ((withoutLatin.length || 0) - (modelValue.length || 0));

                        if (element.context.required) {
                            ngModel.$setValidity('required', isValid(withoutLatin));
                        }
                        ngModel.$viewValue = withoutLatin;
                        ngModel.$render();

                        return withoutLatin;
                    }
                });
                ngModel.$render = function () {
                    var elemAsNode = element.get(0),
                        viewValue = ngModel.$viewValue;
                    element.val(viewValue);
                    // restore cursor position
                    if (ngModel.hscCursorPosition >= 0 && elemAsNode) {
                        elemAsNode.selectionStart = elemAsNode.selectionEnd = ngModel.hscCursorPosition;
                    }
                    ngModel.$commitViewValue();
                };
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

                        ngModel.$viewValue = withoutLatin;
                        ngModel.$render();
                        return withoutLatin;
                    }
                    return value;
                }

                /*
                 * HCS-59777: добавим только parser (dom -> model)
                 * добавлять formatter нельзя т.к. иначе невалидные символы пришедшие извне (с сервера)
                 * будут автоматически затерты (даже без ввода пользователем данных). Если всетаки нужно чтобы контрол
                 * автоматически удалял невалидные данные пришедшие в модель извне, то для HCS-59777 можно сделать
                 * отдельный атрибут выключающий formatter
                 */
                ngModel.$parsers.unshift(filterRussianOnly);
                //ngModel.$formatters.unshift(filterRussianOnly);

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
    .directive('russianAndInteger', function () {
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
                ngModel.$parsers.unshift(function (inputValue) {
                    if (inputValue) {
                        var withoutLatin = inputValue.replace(/[^А-Яа-я0-9]/g, '');
                        if (element.context.required) {
                            ngModel.$setValidity('required', isValid(withoutLatin));
                        }
                        ngModel.$viewValue = withoutLatin;
                        ngModel.$render();

                        return withoutLatin;
                    }
                });
                ngModel.$formatters.unshift(function (modelValue) {
                    if (modelValue) {
                        var withoutLatin = modelValue.replace(/[^А-Яа-я0-9]/g, '');
                        if (element.context.required) {
                            ngModel.$setValidity('required', isValid(withoutLatin));
                        }
                        ngModel.$viewValue = withoutLatin;
                        ngModel.$render();

                        return withoutLatin;
                    }
                });
            }
        };
    })
    .directive('exactLength', function (_) {
        return {
            priority: 101,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }

                ngModel.$parsers.push(process);
                ngModel.$formatters.push(process);

                function process(value) {
                    var stringValue = '' + value;
                    var valid = !value || stringValue.length == attrs.exactLength;
                    ngModel.$setValidity('exactLength', valid);
                    return value;
                }
            }
        };
    })
    .directive('fio', function () {
        var allowed = /[^а-яА-ЯёЁ\*\-\s]/g;
        var isValid = function (s) {
            return s && s.length > 0;
        };
        var process = function (str, element, ngModel) {
            if (str) {
                var withoutLatin = str.replace(allowed, '');
                if (element.context.required) {
                    ngModel.$setValidity('required', isValid(withoutLatin));
                }
                if (ngModel.$viewValue != withoutLatin) {
                    ngModel.$setViewValue(withoutLatin);
                    ngModel.$render();
                }

                return withoutLatin;
            }
        };
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!angular.isDefined(attrs.maxlength)) {
                    attrs.$set('maxlength', '100');
                }
                if (!ngModel) {
                    return;
                }
                ngModel.$parsers.unshift(function (inputValue) {
                    return process(inputValue, element, ngModel);
                });
                ngModel.$formatters.unshift(function (modelValue) {
                    if (modelValue) {
                        return modelValue.replace(allowed, '');
                    }
                });
            }
        };
    })
    .directive('addressFormatter', ['$filter', function ($filter) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                ngModel.$formatters.push(function (value) {
                        return $filter('addressFormatter')(value);
                    }
                );
            }
        };
    }])
    .directive('lengthValidate', ['_', function (_) {
        var isValid = function (modelValue, lengthValidate) {
            return _.indexOf(lengthValidate, (modelValue + '').length.toString()) > -1 || _.indexOf(lengthValidate, (modelValue + '').length) > -1;
        };
        return {
            restrict: 'EA',
            require: '?ngModel',
            scope: {
                lengthValidate: '=lengthValidate'
            },
            link: function ($scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                ngModel.$parsers.unshift(function (inputValue) {
                    return $scope.process(inputValue, element, ngModel);
                });
                ngModel.$formatters.unshift(function (modelValue) {
                    return $scope.process(modelValue, element, ngModel);
                });

                $scope.process = function (modelValue, element, ngModel) {
                    if (modelValue) {
                        ngModel.$setValidity('lengthValidate', isValid(modelValue, $scope.lengthValidate));

                        return modelValue;
                    }
                };

            }
        };
    }])
    .directive('asStringFormatter', function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                ngModel.$formatters.push(function (value) {
                    return '' + value;
                });
            }
        };
    })

    /**
     * Demo http://plnkr.co/edit/m1V8kiFWBfC4KbVEdpkb?p=preview
     *
     * @ngdoc directive
     * @name validityBindFix
     *
     * @description
     * Prevents ngModelController from nulling the model value when it's set invalid by some rule.
     * Works in both directions, making sure an invalid model value is copied into the view value and making sure an invalid
     * model value is copied into the model. **Warning:** totally bypasses formatters/parsers when invalid, but probably good
     * enough to use in most cases, like maxlength or pattern.
     *
     * See angular issue: https://github.com/angular/angular.js/issues/1412
     *
     * Inspired by the strategy provided by Emil van Galen here:
     * http://blog.jdriven.com/2013/09/how-angularjs-directives-renders-model-value-and-parses-user-input/
     *
     * @restrict A
     * @scope
     *
     * @param {object} ngModel Required `ng-model` value. If not present in the same element an error occurs.
     */
    .directive('validityBindFix', function () {
        'use strict';

        return {
            require: '?ngModel',
            priority: 9999,
            restrict: 'A',
            link: function ($scope, $element, $attrs, ngModelController) {
                if (!ngModelController) {
                    return;
                }
                ngModelController.$formatters.unshift(function (value) {
                    if (ngModelController.$invalid && angular.isUndefined(value)) {
                        return ngModelController.$modelValue;
                    } else {
                        return value;
                    }
                });
                ngModelController.$parsers.push(function (value) {
                    if (ngModelController.$invalid && angular.isUndefined(value)) {
                        return ngModelController.$viewValue;

                    } else {
                        return value;
                    }
                });
            }
        };
    })
    /**
     * @description
     * директива для числового input-а, который становится невалидным, если его значение меньше, указанного в параметре
     * источник идеи: http://stackoverflow.com/questions/20982751/custom-form-validation-directive-to-compare-two-fields
     * */
    .directive('aboveThan', [
        function () {

            var link = function ($scope, $element, $attrs, ctrl) {

                var validate = function (viewValue) {
                    var comparisonModel = $attrs.aboveThan;
                    var andEquals = $attrs.andEquals;

                    if (!viewValue || !comparisonModel || (!$attrs.required && !$attrs.validateNotRequired)) {
                        // It's valid because we have nothing to compare against
                        ctrl.$setValidity('aboveThan', true);
                        return viewValue;
                    }

                    if (andEquals) {
                        ctrl.$setValidity('aboveThan', parseFloat(viewValue) >= parseFloat(comparisonModel));
                    } else {
                        ctrl.$setValidity('aboveThan', parseFloat(viewValue) > parseFloat(comparisonModel));
                    }
                    return viewValue;
                };

                ctrl.$parsers.unshift(validate);
                ctrl.$formatters.push(validate);

                $attrs.$observe('aboveThan', function (comparisonModel) {
                    // Whenever the comparison model changes we'll re-validate
                    return validate(ctrl.$viewValue);
                });

                $attrs.$observe('required', function (comparisonModel) {
                    // Whenever the comparison model changes we'll re-validate
                    return validate(ctrl.$viewValue);
                });

            };

            return {
                require: 'ngModel',
                link: link
            };

        }
    ])
    .directive('money', ['$timeout', '_', '$filter', function ($timeout, _, $filter) {
        var process = function (inputVal, element, ngModel, attrs) {
            if(inputVal === null || inputVal === '') {
                return inputVal;
            }

            inputVal = '' + inputVal;
            var keyCode = ngModel.keyCode;
            var checkPrimeryVal = inputVal;
            var oldValue = ngModel.$modelValue;
            var newValue = ngModel.$viewValue;
            var prepairOldValue = '';
            var prepairNewValue = '';
            var cursorPosition = 0;
            var minus = '';
            var negative = (attrs['negative'] === 'true');
            var moneyMaxlength = attrs['moneyMaxlength'] || 8;
            var moneyShouldBeNegative = (attrs['moneyShouldBeNegative'] === 'true');

            if ((negative === true && inputVal.indexOf('-') == '0') || moneyShouldBeNegative) {
                minus = '-'; //save minus
            }

            try {
                cursorPosition = element[0].selectionStart;
            }
            catch (err) {
                cursorPosition = 0;
            }

            inputVal = inputVal.replace(/[^\d.]/g, '');//clear string, also '-'

            //DELETE '.'(dot): compare old and new value, search place(index) where was '.' & paste in
            if (_.isString(oldValue) && _.isString(newValue) && inputVal.length > 2) {
                prepairOldValue = oldValue.replace(/\s/g, '');
                prepairNewValue = newValue.replace(/\s/g, '');
                if (prepairOldValue.indexOf('.') && prepairNewValue.indexOf('.') === -1) {
                    inputVal = prepairNewValue.slice(0, prepairOldValue.indexOf('.')) + '.' + prepairNewValue.slice(prepairOldValue.indexOf('.'));
                    if (keyCode === 46) { //set cursorPosition over the dot '.'
                        cursorPosition++;
                    }
                }
            }

            // HCS-76130
            // Ввели точку или запятую
            // если в oldValue уже была точка, то перекидываем курсор к позиции после нее, а введенную убираем
            (function () {
                if (_.contains(['.', ','], ngModel.keyPress) && cursorPosition > 0) {
                    // oldValue can be string or number or undefined
                    if(angular.isNumber(oldValue) || (angular.isString(oldValue) && oldValue.indexOf('.') > -1)) {
                        // отсекаем случай, когда десятичного разделителя еще не было
                        newValue = newValue.slice(0, cursorPosition - 1) + newValue.slice(cursorPosition);
                        cursorPosition = newValue.indexOf('.') + 1;
                        prepairNewValue = newValue.replace(/\s/g, '');
                        inputVal = newValue.replace(/\s/g, '');
                    }
                }
            })();

            //when cutting spaces. keys:8='backspace',46='delete'

            // убрал удаление сдедующего левого символа при удалении пробела клавишей Backspace
            // т.к. такого требования нет в ТЗ и этот код приводил к ошибке:
            // в случае удаления последней цифры целой части поле целиком очищалось теряя дробную часть
            //if (parseFloat(prepairNewValue) == parseFloat(prepairOldValue) && keyCode == 8) {
            //    cursorPosition--;
            //    inputVal = newValue.slice(0, cursorPosition) + newValue.slice(cursorPosition + 1);
            //}

            if (parseFloat(prepairNewValue) == parseFloat(prepairOldValue) && keyCode == 46) {
                // убрал удаление следующего правого символа при удалении пробела клавишей Delete
                // т.к. такого требования нет в ТЗ
                // смещение курсора в право оставляю для перемещения вправо т.к. стандартно клавиша Delete
                // не смещает курсор
                //inputVal = newValue.slice(0, cursorPosition) + newValue.slice(cursorPosition + 1);
                cursorPosition++;
            }

            //если ввели не цифру, курсор не должен реагировать
            if (parseFloat(inputVal) == parseFloat(prepairOldValue) && keyCode != 46 && keyCode != 8 && keyCode != 96 && !_.contains(['.', ','], ngModel.keyPress)) {
                cursorPosition--;
            }

            // после изменения inputVal к нему опять может добавится '-'
            inputVal = inputVal.replace(/[^\d.]/g, '');//clear string, also '-'

            //clearing left side zeros
            while (inputVal.charAt(0) == '0' && inputVal.length !== 1) {
                inputVal = inputVal.substr(1);
                if ((minus === '-' && cursorPosition < 4 && inputVal.charAt(1) == '.') || (cursorPosition < 3 && inputVal.charAt(1) == '.')) {
                    cursorPosition--;
                }
            }

            var point = inputVal.indexOf('.');
            if (point >= 0) {
                inputVal = inputVal.slice(0, point + 3);
            }

            var decimalSplit = inputVal.split('.');
            var intPart = decimalSplit[0];
            var decPart = decimalSplit[1];

            intPart = intPart.replace(/[^\d]/g, '');
            if (intPart.length > moneyMaxlength) {
                intPart = intPart.slice(0, moneyMaxlength);
            }
            //=============== work on the spaces ==================
            if (intPart.length > 3) {
                var intDiv = Math.floor(intPart.length / 3);
                while (intDiv > 0) {
                    var lastComma = intPart.indexOf(' ');
                    if (lastComma < 0) {
                        lastComma = intPart.length;
                    }

                    if (lastComma - 3 > 0) {
                        intPart = intPart.slice(0, lastComma - 3) + ' ' + intPart.slice(lastComma - 3);
                    }
                    intDiv--;
                }
            }
            //========== work on the decimal part ==================
            if (decPart === undefined || decPart === '' || decPart === '0') {
                decPart = '.00';
            }
            else { //replace numeric to zero
                if (decPart.length === 1) {
                    if (newValue.length == cursorPosition) {
                        decPart = decPart + '0';
                    } else {
                        decPart = '0' + decPart;
                    }
                }
                decPart = '.' + decPart;
            }

            //=========== concat intPart with decPart============================================================
            var money = intPart + decPart;
            if (intPart === '' && decPart === '.00') { //if set only .00
                // HCSINT-11978: при повторном вводе «0» до запятой - поле очищаться не должно
                if (inputVal === '.00') {
                    money = '0.00';
                } else {
                    money = '';
                }

                // если ввели '.' или '0' или '-' и было пусто или 0 то установить '0.00'
                if (keyCode == 46 || keyCode == 48 || keyCode == 189) {
                    if (minus === '' && keyCode == 189) {
                        // случай когда пытаемся ввести минус но поле не отрицательно
                    } else {
                        money = '0.00';
                    }
                }
                if (keyCode == 8 || keyCode == 46) {
                    if (prepairNewValue != '0.0') {
                        cursorPosition = 1;
                    }
                }
                /**
                 * Очистка '-' только в случае если был нажат backspace и предыдущее значение было -0 а новое 0,
                 * иначе в случае нажатия backspace очищаем поле.
                 */
                if (keyCode == 8) {
                    if (checkPrimeryVal==="0.00" && prepairOldValue==="-0.00") {
                        // оставляем '0.00' т.е. только удаляем -
                        money = '0.00';
                    } else {
                        money = '';
                    }
                }
            } else if (intPart === '' && decPart !== '.00') { //if set something after dot
                money = '0' + decPart;
            }

            if((minus + money) !== ngModel.$viewValue) {
                // We should remove keypress because we already process it
                // else $parser will be calls without end
                // HCS-83741
                ngModel.keyPress = null;
                ngModel.$setViewValue(minus + money);
            }

            //==========correction cursor when adding space(s)===================================================
            if (minus === '') {
                if ((money.charAt(cursorPosition - 1) === ' ' || money.charAt(cursorPosition + 1) === '.') && (cursorPosition !== 9) &&
                    prepairNewValue.length > prepairOldValue.length) {
                    cursorPosition++;

                }
            } else {
                if ((money.charAt(cursorPosition - 2) === ' ' || money.charAt(cursorPosition) === '.') && (cursorPosition !== 10) &&
                    keyCode !== 46 && keyCode !== 8) {
                    cursorPosition++;
                }
            }

            //==========for correct delete for key 'backspace'===================================================
            if (keyCode == 8) {
                if (prepairNewValue.length < prepairOldValue.length && (money + minus).length < newValue.length && intPart !== '') {
                    cursorPosition--;
                }
                if (checkPrimeryVal.charAt(cursorPosition) === '-') {
                    cursorPosition++;
                }
            }

            //===========for correct delete for key 'delete'=====================================================
            if (keyCode == 46 && checkPrimeryVal.indexOf('.') >= 0) {
                if ((minus && money.charAt(cursorPosition - 3)) === '.' ||  //-123.0x
                    money.charAt(cursorPosition - 2) === '.' ||  //123.0x
                    (money.charAt(cursorPosition - 1) === '.' && checkPrimeryVal.indexOf('.') !== cursorPosition) ||  //123.x0
                    (money.charAt(cursorPosition + 1) === '.' && money.charAt(cursorPosition) === '0') ||  //0.00
                    (minus && money.charAt(cursorPosition) === '.' && money.charAt(cursorPosition - 1) === '0')  //-0.00
                ) {
                    cursorPosition++;
                } else {
                    if (!minus && money.replace(/\s/g, '').length % 3 === 0 && inputVal.replace(/\s/g, '').length > 4) {
                        cursorPosition--;
                    }
                    if (minus && money.replace(/\s/g, '').length % 3 === 0 && inputVal.replace(/\s/g, '').length > 4 && cursorPosition != 1) {
                        cursorPosition--;
                    }
                }
                //to do: behavior for delete with minus
            }

            //==========rendering of value in <input>============================================================
            ngModel.$render();

            //==========set position of cursor in <input>========================================================
            //                $timeout(function () {
            var el = element[0];
            el.focus();
            el.selectionStart = el.selectionEnd = cursorPosition;
            //                });

            ngModel.keyPress = null;

            return minus + money;
        };

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                element.bind('keydown', function (e) {
                    // all keyboard events include characters, arrows, enter etc..
                    ngModel.keyCode = e.keyCode;
                });
                element.on('keypress.money', function(e){
                    // only events that produces a character: digits, letters, punctuation...
                    // key is character represenation like '.' for press period button
                    ngModel.keyPress =  e.key;
                });
                element.on('blur.money', function () {
                    if (ngModel.$viewValue) {
                        var moneyShouldBeNegative = (attrs['moneyShouldBeNegative'] === 'true');
                        var newViewValue = null;
                        // TODO: moneyShouldBeNegative необходимо проверить и если true тогда минус не убираем
                        // если минус убирать всегда то данном месте будет дефект:
                        // если у поля установлено moneyShouldBeNegative = true и в него ввести 0.00
                        // тогда фокус данного поля не снимается ни при каких условиях
                        // см. дефект HCS-53485
                        // это происходит из-за того что в таком случае после события blur будут вызваны $formatters
                        // которые изменят viewModel и фокус опять вернется к полю
                        if (ngModel.$viewValue === '-0.00' && !moneyShouldBeNegative) {
                            newViewValue = '0.00';
                        } else if (ngModel.$viewValue === '-') {
                            newViewValue = '';
                        }

                        if (newViewValue !== null) {
                            ngModel.$setViewValue(newViewValue);
                            ngModel.$render();
                        }
                    }
                });

                scope.$on('$destroy',function () {
                    element.off('blur.money');
                    element.off('keypress.money');
                });
                ngModel.$parsers.unshift(function (inputValue) {
                    var str = process(inputValue, element, ngModel, attrs);
                    if (str) {
                        str = str.replace(/\s/g, '');
                    }
                    return str;
                });
                ngModel.$formatters.unshift(function (modelValue) {
                    if (modelValue === undefined || modelValue === null || modelValue === '') {
                        return '';
                    }

                    var str = modelValue.toString().replace(/\s/g, '');

                    var moneyShouldBeNegative = (attrs['moneyShouldBeNegative'] === 'true');
                    if (moneyShouldBeNegative) {
                        var digits = parseFloat(modelValue);
                        if (!isNaN(digits) && digits > 0) {
                            // делаем отрицательным, если значение в модели есть И оно положительное
                            // (в модели уже может быть отрицательное число)
                            str = '-' + modelValue;
                        }
                    }

                    var filtered = $filter('moneyNoRoundNoExponent')(str);
                    return filtered;
                });
            }
        };
    }])

    /*
     // То же, что и decimal, только ограничивает ввод по количеству всех символов сразу (целая часть + цифры после запятой)
     */
    .directive('decimal3', ['decimalNumberService', 'DECIMAL_CONST', function (decimalNumberService, DECIMAL_CONST) {
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                var DEFAULT_FRACTION = 2;
                var fraction = scope.$eval(attrs['decimal3']);
                var maxlength = scope.$eval(attrs['length']);
                var maxValue = parseFloat(scope.$eval(attrs['decimalMax']));
                var minValue = parseFloat(scope.$eval(attrs['decimalMin']));

                // Опция автодополнения путой дробной части нулями
                var fractionAutocomplete = scope.$eval(attrs['fractionAutocomplete']);
                if (fractionAutocomplete === undefined) {
                    fractionAutocomplete = true;
                }

                var delimiter = '.';
                var delimiterToReplace = ',';
                var symbolsAfterDelimiter = fraction || fraction === 0 ? fraction : DEFAULT_FRACTION;

                var hasDelimiter = false;
                var indexOfDelimiter = 0;
                var position = 0;

                var disableCutExtraZeros = attrs.hasOwnProperty('disableCutExtraZeros');
                var enableCutSingleMinus = attrs.hasOwnProperty('enableCutSingleMinus');

                element.on('blur.decimal3', function () {
                    if (!isNaN(maxValue) && parseFloat(ngModel.$viewValue) > maxValue ||
                        !isNaN(minValue) && parseFloat(ngModel.$viewValue) < minValue) {
                        ngModel.$setViewValue("");
                        ngModel.$render();
                        return;
                    }

                    // Если введенное число оканчивается разделителем, то дополнить число нулями после разделителя
                    var zeroNumber;
                    if (maxlength) {
                        zeroNumber = maxlength + 1 - position;
                    } else {
                        zeroNumber = DECIMAL_CONST.MAX_AUTOCOMPLETE_ZERO_NUMBER;
                    }

                    var newValue;
                    if (disableCutExtraZeros) {
                        if (ngModel.$viewValue) {
                            newValue = ngModel.$viewValue.toString();
                        } else {
                            newValue = ngModel.$viewValue;
                        }
                    } else {
                        newValue = decimalNumberService.cutExtraZeros(ngModel.$viewValue, DECIMAL_CONST.MAX_AUTOCOMPLETE_ZERO_NUMBER);
                    }
                    if (fractionAutocomplete && hasDelimiter) {
                        newValue = decimalNumberService.autocompleteFraction(newValue, zeroNumber);
                    }

                    // включена опция удаления '-' если значение '-' или '-0.00'
                    if (enableCutSingleMinus && newValue) {
                        if (newValue === '-0.00') {
                            newValue = "0.00";
                        } else if (newValue === '-') {
                            newValue = "";
                        }
                    }

                    ngModel.$setViewValue(newValue);
                    ngModel.$render();
                });
                scope.$on('$destroy',function () {
                    element.off('blur.decimal3');
                });

                ngModel.$parsers.unshift(function (inputValue) {
                    hasDelimiter = false;
                    indexOfDelimiter = 0;
                    position = 0;

                    if (!inputValue) {
                        return;
                    }
                    var digits = inputValue.replace(delimiterToReplace, delimiter);

                    digits = digits.split('').filter(function (s) {
                        if (symbolsAfterDelimiter && s === delimiter && !hasDelimiter && position !== 0) {
                            hasDelimiter = true;
                            indexOfDelimiter = position;
                            position++;
                            return true;
                        } else if (!isNaN(s) && s != ' ') {
                            if (hasDelimiter) {
                                if (!maxlength && position <= indexOfDelimiter + symbolsAfterDelimiter ||
                                    maxlength && position <= indexOfDelimiter + symbolsAfterDelimiter && position <= maxlength) {
                                    position++;
                                    return true;
                                }
                            } else if (!maxlength || maxlength && position < maxlength) {
                                position++;
                                return true;
                            }
                        }
                        return false;
                    }).join('');

                    if (ngModel.$viewValue != digits) {
                        ngModel.$setViewValue(digits);
                        ngModel.$render();
                    }

                    return digits;
                });
            }
        };
    }])

    .directive('timeZoneFormatter', ['$filter', function ($filter) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                ngModel.$formatters.push(function (value) {
                        return $filter('timeZoneFormatter')(value);
                    }
                );
            }
        };
    }])

/**
 * limit string view value (formatting DOM value). Model value does not change.
 */
    .directive('maxlengthFormatter',['$parse', function($parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, element, attr, ngModel) {

                function limitStringLength(value) {
                    if((value === null) || (value === undefined) || (typeof value !== "string")) {
                        return value;
                    }

                    var maxlength = $parse(attr.maxlengthFormatter)($scope);
                    if(value.length > maxlength) {
                        return value.substring(0, maxlength);
                    }
                    return value;
                }

                ngModel.$formatters.unshift(limitStringLength);
            }
        };
    }])

    /**
     * require-non-empty-array
     * Директива перекрывает $isEmpty в контроллере ngModel
     * так, что ng-required устанваливает validity если в ngModel непустой массив
     * Это нужно для нормальной работы ng-required с директивой ui-select2 с множественным выбором
     * Иначе ngModel валиден, если ничего в селекте не выбрано (ngModel.value при этом - пустой массив)
     */
    .directive('requireNonEmptyArray', [
        function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, element, attrs, ngModel) {
                    if (!ngModel) {
                        return;
                    }
                    ngModel.$isEmpty = function (val) {
                        return !val || val.length === 0;
                    };
                }
            };
        }
    ])

    /**
     * remove-spaces
     * Директива удаляет все пробелы в input
     */
    .directive('removeSpaces', function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                }
                function remove_spaces(str){
                    return str.replace(/[\s]/g, '');
                }

                element.on('blur.str_without_spaces', function () {
                    var newValue = remove_spaces(ngModel.$viewValue);
                    ngModel.$setViewValue(newValue);
                    ngModel.$render();
                });
                scope.$on('$destroy',function () {
                    element.off('blur.str_without_spaces');
                });

                ngModel.$parsers.push(function (inputValue) {
                    var transformedInput = remove_spaces(inputValue);

                    if (transformedInput!=inputValue) {
                        ngModel.$setViewValue(transformedInput);
                        ngModel.$render();
                    }

                    return transformedInput;
                });
            }
        };
    })
;
