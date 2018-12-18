angular
    .module('common.filter', [
        'lodash',
        'common.decimal-number-service'
    ])

    .filter('houseAddress', function () {
        return function (addressObj, fromDialog) {
            var propertiesMap = ['region', 'area', 'city', 'settlement', 'street'];

            var result = "";
            if (addressObj) {
                angular.forEach(propertiesMap, function (property, index) {
                    if (fromDialog) {
                        if (addressObj.address && addressObj['address'][property]) {
                            result += addressObj['address'][property] + ', ';
                        }
                    } else {
                        if (addressObj[property] && addressObj[property].formalName) {
                            result += addressObj[property].formalName + ', ';
                        }
                    }
                });

                if (result.length > 0) {
                    result = result.substring(0, result.length - 2);
                }

                var house = fromDialog ? addressObj : addressObj.house;
                if (house) {
                    if (house.houseNumber) {
                        result += ', д.' + house.houseNumber;
                    }
                    if (house.buildingNumber) {
                        result += ', к.' + house.buildingNumber;
                    }
                    if (house.structNumber) {
                        result += ', стр.' + house.structNumber;
                    }
                }
            }

            return result;

        };
    })

    .filter('esiaHouseAddress', function () {
        return function (addressObj) {
            var propertiesMap = ['index', 'region', 'district', 'settlement', 'street'];
            var result = [];
            if (addressObj) {
                angular.forEach(propertiesMap, function (property) {
                    if (addressObj[property]) {
                        result.push(addressObj[property]);
                    }
                });
                if (addressObj.house) {
                    result.push('д.' + addressObj.house);
                }
                if (addressObj.corpus) {
                    result.push('к.' + addressObj.corpus);
                }
                if (addressObj.structure) {
                    result.push('стр.' + addressObj.structure);
                }

                //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
                //Тест падал, т.к. у массива есть функция flat
                if (addressObj.flat && typeof addressObj.flat === 'string') {
                    result.push('кв. ' + addressObj.flat);
                }
            }

            return result.join(', ');

        };
    })

    .filter('addressFormatter', function () {
        return function (value) {
            var stringAddress = '';
            if (_.isObject(value) && (!_.isEmpty(value.address) || !_.isEmpty(value.formattedAddress))) {
                var elem = !_.isEmpty(value.street) ? value.street : value.planningStructureElement;
                var zipCode = (!_.isEmpty(elem) && !_.isEmpty(elem.postalCode)) ? elem.postalCode : '';
                if (_.isEmpty(zipCode) && !_.isEmpty(value.zipCode)) {
                    zipCode = value.zipCode;
                }
                stringAddress = value.address || value.formattedAddress;
                if (!_.isEmpty(zipCode)) {
                    stringAddress = zipCode + ', ' + stringAddress;
                }
                if (!_.isEmpty(value.postalCode) && _.isEmpty(zipCode)) {
                    stringAddress = value.postalCode + ', ' + stringAddress;
                }
            } else if (_.isString(value) && !_.isEmpty(value)) {
                stringAddress = value;
            }
            return stringAddress;
        };
    })

    .filter('timeZoneFormatter', function () {
        return function (value) {
            var result;
            if (value) {
                result = (value.russianName && value.utcCode) ? value.russianName + ' (' + value.utcCode + ')' : value.name;
            }
            return result;
        };
    })

    .filter('geographicalObjectName', function (_) {
        return function (addressObject, reverse) {
            if (typeof addressObject == 'undefined' || addressObject == null) {
                return '';
            }
            var name = addressObject.formalName;
            if (typeof name == 'undefined' || name == null) {
                name = addressObject.name;
            }
            if (typeof name == 'undefined' || name == null) {
                return '';
            }

            var federalSubjects = ['Москва', 'Санкт-Петербург', 'Севастополь'];
            if (_.contains(federalSubjects, name)) {
                return name;
            }

            if (reverse) {
                var prefix = addressObject.shortName;
                if ((prefix == 'проезд') || (prefix == 'р-н') || (prefix == 'г.') || (_.isString(prefix)&&(prefix.slice(-1)=='.'))) {
                    prefix += ' ';
                } else if (_.isString(prefix)) {
                    prefix += '. ';
                }
                return prefix + name;
            }
            return addressObject.shortName ? name + ' ' + addressObject.shortName : name;
        };
    })

/**
 * HCS-77687
 * We can't use filter 'money' in directive 'money' because 
 * expression parseFloat(value).toFixed(2) sometimes get wrong result
 * for examples if value = "111112222233333.12" then it will get wrong "111112222233333.13"
 *
 * Filter 'moneyNoRoundNoExponent' work with number or any big string like number.
 * This filter representation of a number in non-exponential form. For examples:
 * "-1.23456789e-10" -> "-0.000000000123456789"
 *
 * Also filter 'moneyNoRoundNoExponent' doesn't rount input number. It truncates more than two fraction digital without
 * rount. Directive 'money' shouldn't rount viewValue because you should round ngModel.
 * For example if need round number for money you can use function like BillsRoundMoneyUtils.mathRoundFixed2
 * (see web/web-packages/bills-web-package/src/app/utils/round-money-utils.js)
 *
 */
    .filter('moneyNoRoundNoExponent',['decimalNumberService', function(decimalNumberService) {

        function insertSpaces(digitsStr) {
            if(digitsStr.length <= 3) {
                return digitsStr;
            }
            var parts = [];
            for (var i = digitsStr.length; i >= 0; i -= 3) {
                var item = digitsStr.substring(i - 3, i);
                if (item) {
                    parts.push(item);
                }
            }
            parts.reverse();
            return parts.join(' ');
        }

        /**
         * truncate input string and insert spaces
         */
        function formatMoney(numStr) {
            // remove all spaces
            numStr = numStr.replace(/\s/g, "");
            var minus;
            if(numStr.length && numStr[0]==='-') {
                minus = numStr[0];
                numStr = numStr.substr(1, numStr.length);
            } else {
                minus = '';
            }

            numStr = decimalNumberService.cutExtraZeros(numStr, 2);

            var data= numStr.split('.');
            if (data.length===1) {
                if(numStr.length) {
                    return minus + insertSpaces(numStr) + '.00';
                } else {
                    return '0.00';
                }
            } else {
                var digits = data[0];
                var fractions = data[1];

                // fractions format
                if(fractions.length === 0) {
                    fractions = '00';
                } else if (fractions.length === 1) {
                    fractions += '0';
                } else {
                    fractions = fractions.substr(0, 2);
                }

                if(digits.length === 0) {
                    digits = '0';
                } else {
                    digits = insertSpaces(digits);
                }

                return minus + digits + '.' + fractions;
            }
        }

        /*
         * trunsform number to non exponent view.
         * For exmaple: 
         * "-1.23456789e-10" -> "-0.000000000123456789"
         */
        function noExponents(num) {
            var numStr = num.toString();
            var numParts = numStr.split(/[eE]/);

            if(numParts.length === 1) {
                return numParts[0];
            }

            var left = numParts[0];
            var right = numParts[1];

            var minus;
            if(left[0]==='-') {
                minus = left[0];
                left = left.substr(1, left.length);
            } else {
                minus = '';
            }

            var mag = Number(right) + 1;

            //left = decimalNumberService.cutExtraZeros(left, 0);
            var magOffset = left.indexOf('.');
            if(magOffset > 1) {
                mag += (magOffset - 1);
            }

            var leftDigits = left.replace('.', '');
            var z = '';

            // result < 1 => 0.xxx
            if(mag < 0) {
                z = minus + '0.';
                while(mag++) {
                    z += '0';
                }
                return z + leftDigits;
            }

            var zeroCount = mag - leftDigits.length;
            if(zeroCount > 0) {
                // result >= 1
                for(var i=0; i<zeroCount; i++) {
                    z += '0';
                }
                return minus + leftDigits + z;
            } else if(zeroCount===0) { 
                return minus + leftDigits;
            } else {
                // decPos can't be negative here
                var decPos = leftDigits.length + zeroCount;
                var decimalResult;
                if(decPos === 0) {
                    decimalResult = '0.' + leftDigits;
                } else {
                    decimalResult = leftDigits.substr(0, decPos) + '.' + leftDigits.substr(decPos, leftDigits.length);
                }
                return minus + decimalResult;
            }
        }

        return function(amount, currencySymbol) {
            if (amount === null || amount === undefined || amount.length === 0) {
                return amount;
            }

            var strNum = noExponents(amount);
            var result = formatMoney(strNum);

            if (currencySymbol) {
                result += (' ' + currencySymbol);
            } else if (currencySymbol === null) {
                result += ' руб.';
            }

            return result;
        };
    }])

    .filter('money', function () {
        return function (value, currencySymbol) {
            if (value == null || value === '') {
                return '';
            }
            value = parseFloat(value).toFixed(2);
            value = value + '';

            var point = value.indexOf('.');
            var integral = value, fraction;

            if (point > -1) {
                integral = value.substring(0, point);
                fraction = value.substring(point);
            } else {
                fraction = '.00';
            }

            var result = '';
            if (integral.length > 3) {
                var parts = [];
                for (var i = integral.length; i >= 0; i -= 3) {
                    var item = integral.substring(i - 3, i);
                    if (item) {
                        parts.push(item);
                    }
                }
                parts.reverse();
                result = parts.join(' ');
            } else {
                result = integral;
            }

            if (fraction) {
                result += fraction;
            }

            if (currencySymbol == null) {
                result += ' руб';
            } else {
                result += (' ' + currencySymbol);
            }

            return result;
        };
    })

    .filter('month', function () {
        return function (value) {
            var monthes = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
            var num = parseInt(value, 10);

            return monthes[num - 1];
        };
    })

/**
 Returns formatted phone: +7 (###) ###-##-##
 */
    .filter('phone', function () {
        return function (number) {
            if (!number) {
                return '';
            }

            number = String(number);
            number = number.replace(/[^0-9\+]+/g, '');

            var code = '+7 ';
            if (number[0] == '7') {
                number = number.slice(1);
            } else if ((number[0] == '+') && (number[1] == '7')){
                number = number.slice(2);
            }
            // +7 (section1) section2-section3-section4*section5
            var section1 = number.substring(0, 3);
            var section2 = number.substring(3, 6);
            var section3 = number.substring(6, 8);
            var section4 = number.substring(8, 10);
            var section5 = number.substring(10, 16);
            if (section1.length === 3 && section2.length !== 0) {
                section1 = '(' + section1 + ') ';
            } else if (section1.length > 0 && section1.length !== 0) {
                section1 = '(' + section1;
            }
            section2 = (section2.length === 3 && section3.length !== 0) ? section2 + '-' : section2;
            section3 = (section3.length === 2 && section4.length !== 0) ? section3 + '-' : section3;
            if (section5.length !== 0) {
                if (section5.length > 6) {
                    section5 = section5.substring(0, 6);
                }
                section5 = '*' + section5;

            }

            return (code + section1 + section2 + section3 + section4 + section5);
        };
    })

    .filter('ucwords', function () {
        return function (value) {
            if (!value) {
                return '';
            }

            return value.replace(/^(.)|\s(.)/g, function ($1) {
                return $1.toUpperCase();
            });
        };
    })

/**
 * Фильтер ограничивает количество текста, заменяя лишний на выбраное значение(по умолчанию '...')
 */
    .filter('charLimit', function () {
        return function (text, length, end) {
            if (!end) {
                end = "...";
            }
            if (!text || !length || length < end.length || text.length <= length) {
                return text;
            }
            return text.substring(0, length) + end;
        };
    })

    /**
     * фильтр ограничивает число символов, обрезая символы, у которых индекс в строке превышает limit,
     * и добавляет "...". пример: maxTextLimit : 2 изменит текст "123" на "12..."
     */

    .filter('maxTextLimit', function () {
        return function (text, limit) {
            var end = "...";

            if (! text || !limit || text.length <= limit) {
                return text;
            }

            return text.substring(0, limit) + end;
        };
    })

    .filter("areaFormatter", function (_) {
        return function (value) {
            if (value) {
                return value + " м<sup>2</sup>";
            } else {
                return '-';
            }
        };
    })

    .filter("precentFormatter", function (_) {
        return function (value) {
            if (value) {
                return value + "%";
            } else {
                return '-';
            }
        };
    })
    .constant('ESTStatusEnum',{
        'NE_OPREDELENO':{value : '0', name:'Не определено', string_name:'NE_OPREDELENO'},
        'VLADENIE':{value : '1', name:'Владение', string_name:'VLADENIE'},
        'DOM':{value : '2', name:'Дом', string_name:'DOM'},
        'DOMOVLADENIE':{value : '3', name:'Домовладение', string_name:'DOMOVLADENIE'},
        'UCHASTOK':{value : '4', name:'Участок', string_name:'UCHASTOK'}
    }).filter("ESTSStatusFilter", function (ESTStatusEnum) {
        return function (status) {
           if (ESTStatusEnum[status]){
               return ESTStatusEnum[status].name;
           } else {
               return '';
           }
        };
    })

    /**
     * Применяет маску (по правилам StringMask)
     * {{data.someUnmaskedValue | hcsApplyStringMask : '8 (999) 999-99-99'}}
     */
    .filter('hcsApplyStringMask', [
        '$log',
        function ($log) {
            return function (unmaskValue, mask) {
                if (!mask) {
                    return unmaskValue;
                }

                if (!StringMask) {
                    $log.warn('Not found StringMask in global object (required in filter "hcsApplyStringMask")');
                    return unmaskValue;
                }

                return StringMask.apply(unmaskValue, mask);
            };
        }
    ])

    /**
     * Преобразовывет дату в строковую дату по Москве
     */
    .filter('cmDateByMsk', function() {
        return function (date) {
            // С 26 октября 2014 года таймзона соответствует UTC+3,
            // с 27 марта 2011 года по 25 октября 2014 года соответствовала UTC+4.
            // то что раньше 27 марта 2011 походу тоже в UTC+4
            var startDateInTz3 = 1414357200000; // =27.10.2014 (26.10.2014 все равно в UTC+4)

            date = (date instanceof Date) ? date.getTime() : date;
            var timezona = date < startDateInTz3 ? '+0400' : '+0300';
            return moment(date).utcOffset(timezona).format('DD.MM.YYYY');
        };
    })

    /**
     * Преобразовывет строковую дату
     * Принимает: строка 'дд.мм.гггг' (20.03.2017)
     * Отдает: '[дд] [полное название месяца] [гггг] года' (20 марта 2017 года)
     * {{data.someTimeInString | normalizeStringDateFilter}}
     */
    .filter("normalizeStringDateFilter", function () {
        return function (date, hideYearText) {
            var answer = "";           

            if (date && typeof(date) == 'string') {
                var monthNamesShort = [ "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря" ];
                var dateArr = date.split('.');
                var day = parseInt(dateArr[0], 10);
                var month = monthNamesShort[parseInt(dateArr[1], 10) - 1];
                var year = parseInt(dateArr[2], 10);
                
                if (day && month && year) {
                    answer = [day, month, year].join(' ');
                }

                if (!hideYearText) {
                    answer += ' года';
                }
            }
            return answer;
        };
    })

    .filter("normalizeDateFiller", function ($filter) {
        return function (date, addTime, hideYearText) {
            if (date) {
                var monthNamesShort = [ "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря" ];
                var answer;
                var month = $filter('date')(date, "M", null);
                if(addTime === true){
                    answer = $filter('date')(date, "d месяц yyyy года, HH:mm", null);
                }else{
                    answer = $filter('date')(date, "d месяц yyyy года", null);
                }
                answer = answer.replace('месяц',monthNamesShort[month-1]);
                if(hideYearText === true){
                    answer = answer.replace(' года','');
                }
                return  answer;
            } else {
                return "";
            }
        };
    })

     /**
     * Показываем окопф в виде:
     * "код - название"
     */
    .filter('ppaFilterOkopf', [
        function () {
            return function (okopfEntity) {
                if (!okopfEntity) {
                    return null;
                }
                return okopfEntity.code + ' - ' + okopfEntity.name;
            };
        }
    ])

    .filter('ppaFilterOktmo', [
        '_',
        function (_) {
            return function (oktmo) {
                if (!oktmo) {
                    return null;
                }
                return _([oktmo.code, oktmo.name])
                    .filter()
                    .value()
                    .join(' - ');
            };
        }
    ])

    /**
     * OrganizationRoleWithNsi => название территории действия
     *
     * (должен быть загружен common.auth, скорее всего это так и будет, но если будет создавать проблемы - добавить зависимость
     * в модуль и поправить тесты, где юзается common.filter)
     *
     * FIXME После мержа ветки 11.2.0_ppa аналогичный фильтр в ppa надо будет выпилить
     */
    .filter('ppaOrganizationRoleToTerritoryName', [
        'PpaOrganizationRolesConfig',
        'permissionsConfig',
        '_',
        '$filter',
        function (PpaOrganizationRolesConfig, permissionsConfig, _, $filter) {
            var SHOULD_NOT_ASSIGN = 'Не указывается';
            var organiztionRolesByNsiCode = permissionsConfig.getOrganizationRolesByNsiCode();
            var organizationRolesConfigByNsiCode = _.mapValues(organiztionRolesByNsiCode, function (r) {
                return PpaOrganizationRolesConfig[r.code];
            });

            return function (organizationRoleWithNsi) {
                if (!(organizationRoleWithNsi && organizationRoleWithNsi.role && organizationRoleWithNsi.role.code)) {
                    return null;
                }

                if (!organizationRolesConfigByNsiCode.hasOwnProperty(organizationRoleWithNsi.role.code)) {
                    return null;
                }

                var roleConfig = organizationRolesConfigByNsiCode[organizationRoleWithNsi.role.code];

                if (!roleConfig) {
                    return SHOULD_NOT_ASSIGN;
                }

                if (roleConfig.regions && organizationRoleWithNsi.region) {
                    return $filter('geographicalObjectName')(organizationRoleWithNsi.region);
                }

                if (roleConfig.oktmos && organizationRoleWithNsi.oktmo) {
                    return $filter('ppaFilterOktmo')(organizationRoleWithNsi.oktmo);
                }

                if (organizationRoleWithNsi.hasOwnProperty('house')) {
                    return organizationRoleWithNsi.house.formattedAddress;
                }

                if (!roleConfig.regions && !roleConfig.oktmos) {
                    return SHOULD_NOT_ASSIGN;
                }

                return null;
            };
        }
    ])

    /**
     * OrganizationRef => краткое наименование организации, если нет краткого, то полное
     */
    .filter('ppaFilterOrganizationRefToName', [
        function(){
            return function organizationRefToName (organizationRef) {
                if(!organizationRef) {
                    return organizationRef;
                }
                return organizationRef.shortName || organizationRef.fullName;
            };
        }
    ])

    /**
     * Если пусто, заменяем на тире
     * <span ng-bind="data.coolValue | hcsReplaceIfEmpty : 'Нет данных'">
     */
    .filter('hcsReplaceIfEmpty', [
        '_',
        function (_) {
            var dash = '—';
            return function (val, customReplacer) {
                if (val || _.isBoolean(val)) {
                    return val;
                }
                return customReplacer || dash;
            };
        }
    ])

    /**
     * Для добавления корректных переносов для не которых определнных слов
     * чтобы можно было уложить в узкий столбец, например длинное название функции организации
     */
    .filter('hcsDictHyphenation', [
        '_',
        function (_) {

            var dict = [
                {
                    ptrn: /Ресурсоснабжающая/g,
                    val: 'Ре&shy;сур&shy;со&shy;снаб&shy;жа&shy;ющая'
                },
                {
                    ptrn: /организация/g,
                    val: 'ор&shy;га&shy;ни&shy;за&shy;ция'
                },
                {
                    ptrn: /специализированный/g,
                    val: 'спе&shy;ци&shy;али&shy;зи&shy;ро&shy;ван&shy;ный'
                }
            ];

            return function (str) {
                if (!angular.isString(str)) {
                    return str;
                }

                var result = _.reduce(dict, function(acc, entry){
                    return acc.replace(entry.ptrn, entry.val);
                }, str);
                return result;
            };
        }
    ])
;
