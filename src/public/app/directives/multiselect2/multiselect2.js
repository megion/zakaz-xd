angular.module('zakaz-xd.directives.multiselect2', [
    'common.hcs.ui.select2'
])
    .directive('multiselect2', function () {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                ngModel: '=',
                required: '=',
                name: '@'
            },
            templateUrl: 'app/directives/multiselect2/multiselect2.tpl.html',
            controller: ['$scope', '$element', function ($scope, $element) {
                var defaultOptions = {
                    multiple: true,
                    overloadedClasses: {
                        multi: HcsMulti
                    }
                };

                var MultiSelect2 = window.Select2["class"].multi;
                // define class HcsMulti for override createContainer function
                function HcsMulti() {
                    MultiSelect2.apply(this, arguments);
                }
                HcsMulti.prototype = Object.create(MultiSelect2.prototype);
                HcsMulti.prototype.createContainer = function() {
                    var _container = MultiSelect2.prototype.createContainer.apply(this, arguments);
                    _container.find('ul.select2-choices').append("<span class='multiselect2__trigger'></span>");
                    return _container;
                };

                $scope.options = angular.extend(defaultOptions, $scope.options);

            }]
        };
    })
;