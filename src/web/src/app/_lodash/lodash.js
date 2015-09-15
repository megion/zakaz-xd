/**
 *
 */
(function (angular, _) {
    'use strict';
    var m,
        moduleNameHtml = 'lodash',
        moduleDependency = [
            /* none */
        ]
        ;
    m = angular.module(moduleNameHtml, moduleDependency);
    m.service('_', function () {
        return _;
    });

    if (_ === undefined) {
        console.log('WARN: Не подключена библиотека loDash.');
        return;
    }
    // Mixing in the object selectors
    // ------------------------------
    _.mixin({
        // Проинициализирует свойства object значениями одноименных свойств из source.
        // Если в source такое свойство не определено, то будет оставлено значение из object.
        fill: function fill(object, source) {
            if (_.isObject(source)) {
                _.each(object, function (value, key) {
                    if (source[key] !== undefined) {
                        object[key] = source[key];
                    }
                });
            }
            return object;
        }
    });

    _.mixin({
        pushAll: function (destArr, srcArr) {
            Array.prototype.push.apply(destArr, srcArr);
        },
        replaceArrayContent: function (dest, src) {
            if (!dest || !src) {
                return;
            }

            dest.length = 0;
            _.pushAll(dest, src);
        },
        clearArray: function (arr) {
            _.replaceArrayContent(arr, []);
        }
    });

    _.cleanEmpty = function (object) {
        return _.omit(object, function (value) {
            if (_.isObject(value) || _.isArray(value)) {
                value = _.cleanEmpty(value);
                return _.isEmpty(value);
            }
            return _.isUndefined(value) || _.isNull(value) || _.isNaN(value) || value === '';
        });
    };
}(angular, window._));

