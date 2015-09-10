angular.module('zakaz-xd.directives.decimal', [
    'ui.bootstrap',
    'ngSanitize'
])
    .constant('DECIMAL_CHARS', {
        MINUS: '-',
        DELIMITER: '.'
    })
    .service('decimalNumberService',['DECIMAL_CHARS', function(DECIMAL_CHARS) {
        function zeroCount(str, isRevert) {
            var revers = false;
            if (isRevert) {
                // from end to begin string
                revers = true;
            }

            var count = 0;
            for (var i=0; i<str.length; i++) {
                if ((!revers) && (i===0) && (str[0]===DECIMAL_CHARS.MINUS)) {
                    // случай минус вначале
                } else {
                    var j = i;
                    if (revers) {
                        j = str.length - i - 1;
                    }

                    if (str[j]==='0') {
                        count++;
                    } else {
                        // if not 0 then return result
                        return count;
                    }
                }
            }
            return count;
        }

        var self = this;
        /**
         * Удаление лишних нулей вначале и в конце, пример
         * '0001.01000' -> '1.01'
         * '0123.000' -> '123.00'
         * @param decimalStr
         * @param delimiter - разделитель
         * @param countRightDisabledZero - число нулей после разделителя которое не должно быть вырезано
         */
        self.cutExtraZeros = function (decimalStr, countRightDisabledZero) {
            if (!decimalStr) {
                return decimalStr;
            }

            var numParts = decimalStr.split(DECIMAL_CHARS.DELIMITER);
            var left = numParts[0];

            var result = '';
            if (left.length>1) {
                // удаление нулей в левой части
                var lz = zeroCount(left);
                if (lz === 0) {
                    // нет нулей
                    result = left;
                } else {
                    var withoutMinus = left;
                    if(left[0]===DECIMAL_CHARS.MINUS) {
                        // на первом месте минус
                        withoutMinus = left.substring(1, left.length);
                    }

                    if (withoutMinus.length === lz) {
                        // тогда оставим один 0 первого разряда
                        result = left[0] + withoutMinus[withoutMinus.length-1];
                    } else {
                        result = left[0] + withoutMinus.substring(lz, withoutMinus.length);
                    }
                }
            } else {
                result = left;
            }

            if (numParts.length>1) {
                var right = numParts[1];
                result += DECIMAL_CHARS.DELIMITER;
                if (right.length > countRightDisabledZero) {
                    // удаление нулей в правой части
                    var rz = zeroCount(right, true);
                    if (rz === 0) {
                        // нет нулей
                        result += right;
                    } else if (right.length === rz) {
                        // тогда оставим countRightDisabledZero первых нулей
                        result += right.substring(0, countRightDisabledZero);
                    } else {
                        result += right.substring(0, right.length-rz);
                    }
                } else {
                    // число знаков после запятой меньше либо равно числу не удаляемых нулей
                    result += right;
                }
            }
            return result;
        };
    }])
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
    .directive('decimal', ['decimalNumberService', function (decimalNumberService) {
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                console.log("Link decimal");
                if (!ngModel) {
                    return;
                }
                var DEFAULT_FRACTION = 2;
                var AUTO_COMPLETION_ZERO_NUMBER = 2;
                var fraction = scope.$eval(attrs['decimal']);
                var negative = scope.$eval(attrs['negative']);
                var maxValue = parseFloat(scope.$eval(attrs['decimalMax']));

                // Опция автодополнения путой дробной части нулями
                var fractionAutocomplete = scope.$eval(attrs['fractionAutocomplete']);
                if (fractionAutocomplete === undefined) {
                    fractionAutocomplete = true;
                }

                var delimiter = '.';
                var minus = '-';
                var symbolsAfterDelimiter = fraction || fraction === 0 ? fraction : DEFAULT_FRACTION;
                var hasDelimiter = false;
                var hasMinus = false;

                // Если введенное число оканчивается разделителем, то дополнить число нулями после разделителя
                element.on('blur', function () {
                    var value = ngModel.$viewValue;
                    //var newValue = value;
                    var newValue = decimalNumberService.cutExtraZeros(value, delimiter, AUTO_COMPLETION_ZERO_NUMBER);
                    console.log("newValue", newValue);

                    if (fractionAutocomplete && hasDelimiter) {

                        if (newValue && newValue.length === (newValue.indexOf(delimiter) + 1)) {
                            for (var i = 0; i < AUTO_COMPLETION_ZERO_NUMBER; ++i) {
                                newValue += '0';
                            }
                            //ngModel.$rollbackViewValue();
                            //ngModel.$modelValue = value;
                        }
                    }

                    console.log('newValue2', newValue);
                    if (newValue !== value) {
                        ngModel.$setViewValue(newValue);
                        ngModel.$render();
                    }
                });
                scope.$on('$destroy',function () {
                    element.off('blur');
                });

                ngModel.$parsers.unshift(function (inputValue) {
                    hasDelimiter = false;
                    hasMinus = false;
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

                    //return null;
                    //console.log("return digits", digits);
                    return digits;
                });
            }
        };
    }])
/**
 * В отличие от директивы decimal, есть ограничение по кол-ву символов в целой части
 * */
    .directive('decimal2', function ($compile) {
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                console.log("Link decimal2");
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
                var minus = '-';
                var symbolsAfterDelimiter = fraction || fraction === 0 ? fraction : DEFAULT_FRACTION;

                var hasDelimiter = false;
                var hasMinus = false;

                //после установки данного параметра при невалидных decimalMin, decimalMax их значения не будут удаляться -
                //поле при этом станет невалидным
                var showMinMaxError = scope.$eval(attrs['showMinMaxError']);

                //element.bind('blur', function() {
                //
                //});

                element.bind('blur', function () {
                    if(showMinMaxError){
                        if(!isNaN(maxValue)){
                            if(parseFloat(ngModel.$viewValue) > maxValue){
                                ngModel.$setValidity('decimalMax', false);
                            }else{
                                ngModel.$setValidity('decimalMax', true);
                            }
                            scope.$apply();
                        }
                        if(!isNaN(minValue)){
                            if(parseFloat(ngModel.$viewValue) < minValue){
                                ngModel.$setValidity('decimalMin', false);
                            }else{
                                ngModel.$setValidity('decimalMin', true);
                            }
                            scope.$apply();
                        }
                    }else{
                        if (!isNaN(maxValue) && parseFloat(ngModel.$viewValue) > maxValue ||
                            !isNaN(minValue) && parseFloat(ngModel.$viewValue) < minValue) {
                            ngModel.$setViewValue("");
                        }
                    }
                    // Если введенное число оканчивается разделителем, то дополнить число нулями после разделителя
                    if (fractionAutocomplete && hasDelimiter) {
                        var value = ngModel.$viewValue;
                        if (value && value.length === (value.indexOf(delimiter) + 1)) {
                            for (var i = 0; i < symbolsAfterDelimiter; ++i) {
                                value += '0';
                            }
                            ngModel.$viewValue = value;
                        }
                    }
                    ngModel.$render();
                });

                ngModel.$parsers.unshift(function (inputValue) {
                    console.log("decimal2 unshift", inputValue);

                    hasDelimiter = false;
                    hasMinus = false;
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
                        //Чтобы не разбираться, с какого места редактировали число, просто отображаем предыдущее значение.
                        //Если предыдущего нет (например, "ctrl + V") - отрезаем последние символы. Для целой части чуть ниже делаем то же самое.
                        //HCS-15500
                        digits = ngModel.$modelValue ? ngModel.$modelValue : digits.slice(0, -(numberOfSymbolsToCutOff));
                    }
                    if (maxSymbolsBeforeDelimiter) {

                        var checkAndShortenFractalPart = function (fractalPart) {
                            numberOfSymbolsToCutOff = fractalPart.length - maxSymbolsBeforeDelimiter;
                            if (numberOfSymbolsToCutOff > 0) {
                                if(ngModel.$modelValue) {
                                    return ngModel.$modelValue.substr(0, maxSymbolsBeforeDelimiter);
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
                        ngModel.$viewValue = digits;
                        ngModel.$render();
                    }

                    return digits;
                });
            }
        };
    })
    /*
     // То же, что и decimal, только ограничивает ввод по количеству всех символов сразу (целая часть + цифры после запятой)
     */
    .directive('decimal3', function () {
        return {
            priority: 1,
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                console.log("Link decimal3");
                if (!ngModel) {
                    return;
                }
                var DEFAULT_FRACTION = 2;
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
                var symbolsAfterDelimiter = DEFAULT_FRACTION;

                var hasDelimiter = false;
                var indexOfDelimiter = 0;
                var position = 0;

                element.bind('blur', function () {
                    if (!isNaN(maxValue) && parseFloat(ngModel.$viewValue) > maxValue ||
                        !isNaN(minValue) && parseFloat(ngModel.$viewValue) < minValue) {
                        ngModel.$setViewValue("");
                    } else {
                        // Если введенное число оканчивается разделителем, то дополнить число нулями после разделителя
                        if (fractionAutocomplete && hasDelimiter) {
                            var value = ngModel.$viewValue;
                            if (value && value.length === (value.indexOf(delimiter) + 1)) {
                                var end = maxlength;
                                if (!end) {
                                    end = position + 2;
                                }
                                for (var i = position; i < end; ++ i) {
                                    value += '0';
                                }
                                ngModel.$viewValue = value;
                            }
                        }
                    }
                    ngModel.$render();
                });

                ngModel.$parsers.unshift(function (inputValue) {
                    console.log("decimal3 unshift", inputValue);

                    hasDelimiter = false;
                    indexOfDelimiter = 0;
                    position = 0;

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
                        ngModel.$viewValue = digits;
                        ngModel.$render();
                    }

                    return digits;
                });
            }
        };
    })
;