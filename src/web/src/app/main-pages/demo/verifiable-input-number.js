/**
 * compare ngModel number with number from attribute 'billsVerifiableInputNumber'.
 * If numbers are not equals then show warning icon. Directive show/hide icon like 'clearable' directive and
 * warning incon displayed considering 'clearable' element.
 *
 */
angular
    .module('bills.verifiable-input-number', [
        'ui.bootstrap.tooltip'
    ])
    .directive('money2', ['$timeout', '_', '$filter', function ($timeout, _, $filter) {

        function isNumberKeyCode(keyCode) {
            if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)) { 
                // 0-9 only
                return true;
            }
            return false;
        }

        function isRemoveSpace(newValue, oldValue) {
            if(newValue && oldValue && newValue.length && oldValue.length && newValue.length < oldValue.length) {
                for(var i=0; i<newValue.length; i++) {
                    var newChar = newValue.charAt(i);
                    var oldChar = oldValue.charAt(i);
                    if(newChar !== oldChar && oldChar === ' ') {
                        return true;
                    }
                }
            }
            //var newFiltered = $filter('moneyNoRoundNoExponent')(newValue);
            //var oldFiltered = $filter('moneyNoRoundNoExponent')(oldValue);

            //if(newFiltered === oldFiltered) {
                //return true;
            //}
            
            return false;
        }

        function fixCursorPosition(oldValue, newValue, keydownEventInfo, element) {
            var el = element[0];
            var cursorPosition;
            if(newValue && oldValue && newValue.length && oldValue.length) {

                var cursorOffset = 0;

                var removedCharsCount = oldValue.length - newValue.length;
                if(removedCharsCount > 1) {
                    var selectionRange = keydownEventInfo.selectionEnd - keydownEventInfo.selectionStart;
                    if(selectionRange === 0) {
                        selectionRange = 1;
                    }

                    if((removedCharsCount - selectionRange) > 0) {
                        // user removed one char but real remove more then one value
                        cursorOffset = -1;
                    }
                }
                cursorPosition = keydownEventInfo.selectionStart + cursorOffset;
                if(cursorPosition >= 0) {
                    el.focus();
                    el.selectionStart = el.selectionEnd = cursorPosition;
                }
            } else {
                cursorPosition = el.selectionStart;
                el.focus();
                el.selectionStart = el.selectionEnd = cursorPosition;
            }

        }

        function clearMoney(inputVal) {
            if(!(inputVal && inputVal.length)) {
                return inputVal; 
            }

            //clear string, also '-' and '.'
            inputVal = inputVal.replace(/[^\d]/g, '');

            if(inputVal.length === 1) {
                inputVal = '0.0' + inputVal;
            } else if(inputVal.length === 2) {
                inputVal = '0.' + inputVal;
            }  else if(inputVal.length >= 3) {
                inputVal = inputVal.substring(0, inputVal.length-2) + '.' +
                    inputVal.substring(inputVal.length-2, inputVal.length);
            }

            return inputVal;
        }

        function renderMoney(inputVal, element, ngModel, attrs) {

            var oldMoneyValue = ngModel.newMoneyValue;

            //var el = element[0];
            //var cursorPosition = el.selectionStart;
            //
            
            //clear string, also '-'
            inputVal = clearMoney(inputVal);

            var filtered = $filter('moneyNoRoundNoExponent')(inputVal);
            ngModel.newMoneyValue = filtered;

            ngModel.$setViewValue(filtered);
            ngModel.$render();

            if(ngModel.keydownEventInfo) {
                fixCursorPosition(oldMoneyValue, ngModel.newMoneyValue, ngModel.keydownEventInfo, element);
            }
            //ngModel.keydownEventInfo = null;

            return filtered;
        }

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

            if (isRemoveSpace(ngModel.newRawInputValue, ngModel.oldRawInputValue) && keyCode == 46) {
                // убрал удаление следующего правого символа при удалении пробела клавишей Delete
                // т.к. такого требования нет в ТЗ
                // смещение курсора в право оставляю для перемещения вправо т.к. стандартно клавиша Delete
                // не смещает курсор
                //inputVal = newValue.slice(0, cursorPosition) + newValue.slice(cursorPosition + 1);
                cursorPosition++;
            }

            //если ввели не цифру, курсор не должен реагировать
            if(!isNumberKeyCode(keyCode)) {
                cursorPosition--;
            }
            //if (parseFloat(inputVal) == parseFloat(prepairOldValue) && keyCode != 46 && keyCode != 8 && keyCode != 96 && !_.contains(['.', ','], ngModel.keyPress)) {
                //cursorPosition--;
            //}

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
                if ((money.charAt(cursorPosition - 1) === ' ' || money.charAt(cursorPosition + 1) === '.') &&
                    (cursorPosition !== 9) &&
                    prepairNewValue.length > prepairOldValue.length) {
                    cursorPosition++;

                }
            } else {
                if ((money.charAt(cursorPosition - 2) === ' ' || money.charAt(cursorPosition) === '.') &&
                    (cursorPosition !== 10) &&
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
                //element.on('input.money', function(e) {
                    //ngModel.oldRawInputValue = ngModel.newRawInputValue;
                    //ngModel.newRawInputValue = e.currentTarget.value;
                //});
                element.on('keydown.money', function(e) {
                    // all keyboard events include characters, arrows, enter etc..
                    ngModel.keyCode = e.keyCode;
                    ngModel.keydownEventInfo = {
                        selectionStart: e.currentTarget.selectionStart,
                        selectionEnd: e.currentTarget.selectionEnd,
                        selectionDirection: e.currentTarget.selectionDirection
                    };
                });
                //element.on('keypress.money', function(e){
                    //// only events that produces a character: digits, letters, punctuation...
                    //// key is character represenation like '.' for press period button
                    //ngModel.keyPress =  e.key;
                //});
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
                    //element.off('keypress.money');
                    element.off('keydown.money');
                    //element.off('input.money');
                });
                ngModel.$parsers.unshift(function (inputValue) {
                    //var str = process(inputValue, element, ngModel, attrs);
                    var str = renderMoney(inputValue, element, ngModel, attrs);
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
                    ngModel.newMoneyValue = filtered;
                    return filtered;
                });
            }
        };
    }])
    .directive('billsVerifiableInputNumber', ['$parse', '$q', '$timeout', '$compile', '_', 
        function ($parse, $q, $timeout, $compile, _) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, $element, $attrs, ngModel) {

                function getNumberOrNull(number) {
                    var res = parseFloat(number);
                    return isNaN(res) ? null : res;
                }

                function isNumberEquals(v1, v2) {
                    if(v1 === null && v2 === null) {
                        return true;
                    }
                    return v1 === v2;
                }
                
                var prefix = 'billsVerifiableInputNumber';
                var disabledAttrName = prefix + 'IsDisabled';

                var isClearable = $attrs.hasOwnProperty('clearable');

                if(!isClearable) {
                    // if clearable directive does not exit the add container with position relative
                    // it need for position absolute for warning icon
                    $element.wrap('<div class="form-base__container-form-control"></div>');
                }

                $element.addClass('form-base__verifiable-input-number-control');

                function getTooltipHtmlText() {
                    return _.escape('<div class="text-left">Значение не совпадает с автоматически рассчитанным</div>');
                }

                var warningIconHtml = '<i class="glyphicon glyphicon-exclamation-sign ' + 
                    'form-base__verifiable-input-number-warning-icon" ' + 
                    'tooltip-html-unsafe="' + getTooltipHtmlText() + '"' +
                    'tooltip-trigger ' +
                    'tooltip-placement="bottom-right" ' +
                    'tooltip-append-to-body="true"></i>';

                var warningIcon = $compile(warningIconHtml)($scope);
                $element.after(warningIcon);
            
                function updateVisibility() {
                    var modelNumber = null;
                    var isEquals;

                    var isDisabled = !!$parse($attrs[disabledAttrName])($scope);
                    if(isDisabled) {
                        isEquals = true;
                    } else {
                        modelNumber = getNumberOrNull($parse($attrs.ngModel)($scope));
                        var normNumber = getNumberOrNull($parse($attrs[prefix])($scope));
                        isEquals = isNumberEquals(normNumber, modelNumber);
                    }

                    if(isClearable) {
                        // remove classes if clearable is hided or warinig icon is hided
                        if((modelNumber === null) || isEquals) {
                            $element.removeClass('form-base__verifiable-input-number-control_with-clearable');
                            warningIcon.removeClass('form-base__verifiable-input-number-warning-icon_with-clearable');
                        } else {
                            $element.addClass('form-base__verifiable-input-number-control_with-clearable');
                            warningIcon.addClass('form-base__verifiable-input-number-warning-icon_with-clearable');
                        }
                    }

                    if(isEquals) {
                        $element.removeClass('form-base__verifiable-input-number-control_has-warning');
                        warningIcon.css('display', 'none');
                    } else {
                        $element.addClass('form-base__verifiable-input-number-control_has-warning');
                        warningIcon.css('display', 'block');
                    }
                }

                $scope.$watch($attrs[prefix], function () {
                    updateVisibility();
                });

                $scope.$watch($attrs.ngModel, function () {
                    updateVisibility();
                });

                $scope.$watch($attrs[disabledAttrName], function () {
                    updateVisibility();
                });

            }
        };
    }]);
