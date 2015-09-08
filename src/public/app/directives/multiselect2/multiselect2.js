angular.module('zakaz-xd.directives.multiselect2', [
    'common.hcs.ui.select2'
])
    .directive('multiselect2', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: {
                options: '=',
                ngModel: '=',
                required: '=',
                disabled: '=',
                readonly: '=',
                onChange: '=',
                name: '@',
                class: '@'
            },
            templateUrl: 'app/directives/multiselect2/multiselect2.tpl.html',
            controller: ['$scope', '$element', function ($scope, $element) {
                var defaultOptions = {
                    multiple: true,
                    selectAllText: "ВЫБРАТЬ ВСЕ",
                    placeholder: "Выберите одно или несколько значений",
                    overloadedClasses: {
                        multi: HcsMulti
                    },
                    data: {
                        text: function(item) {
                            throw new Error("'data.text' function not implemented");
                        }
                    },
                    id: function(item) {
                        throw new Error("'id' function not implemented");
                    },
                    formatResult: function(item, container, query) {
                        throw new Error("'formatResult' function not implemented");
                    },
                    formatSelection: function(item) {
                        throw new Error("'formatSelection' function not implemented");
                    }

                };

                var select2El = $element.find("input");

                $scope.$watch(function () {
                    return $scope.ngModel;
                }, function (newVal, oldVal) {
                    if (oldVal && oldVal.length===0 && (!newVal || newVal.length===0)) {
                        return;
                    }
                    if (newVal && newVal.length===0 && (!oldVal || oldVal.length===0)) {
                        return;
                    }
                    if (!newVal && !oldVal) {
                        return;
                    }
                    if (!$scope.ngModel) {
                        $scope.ngModel = [];
                    }
                    if ($scope.onChange) {
                        // hot fix: run callback after digest cycle for ngModel is changed complete
                        $timeout(function () {
                            $scope.onChange($scope.ngModel);
                        });
                    }
                }, true);

                // remove attribute class for container
                if ($scope.class) {
                    $element.removeAttr('class');
                }

                $scope.options = angular.extend(defaultOptions, $scope.options);

                var MultiSelect2 = window.Select2["class"].multi;
                // define class HcsMulti for override createContainer function
                function HcsMulti() {
                    MultiSelect2.apply(this, arguments);
                }
                HcsMulti.prototype = Object.create(MultiSelect2.prototype);
                HcsMulti.prototype.createContainer = function() {
                    var _container = MultiSelect2.prototype.createContainer.apply(this, arguments);
                    _container.find('ul.select2-choices').append("<span class='multiselect2__trigger'></span>");

                    // TODO: I.Zadorozhny: feature "select all" implemented in select2 since 4.0
                    var selectAllLink = $( "<a href='javascript:void(0)' class='multiselect2__select-all' >" + $scope.options.selectAllText + "</a>" );
                    var resultsContainer = _container.find('div.select2-drop.select2-drop-multi ul.select2-results');
                    var self = this;
                    selectAllLink.click(function(event) {
                        // check all selected already
                        $scope.$apply(function () {
                            if ($scope.ngModel) {
                                var valuesMap = {};
                                for (var i=0; i<$scope.ngModel.length; i++) {
                                    var v = $scope.ngModel[i];
                                    valuesMap[$scope.options.id(v)] = v;
                                }
                                for (var j=0; j<$scope.options.data.results.length; j++) {
                                    var vr = $scope.options.data.results[j];
                                    if (!valuesMap[$scope.options.id(vr)]) {
                                        $scope.ngModel.push(vr);
                                    }
                                }
                            } else {
                                $scope.ngModel = [].concat($scope.options.data.results);
                            }
                            select2El.trigger("change");
                        });

                        self.close();
                        event.preventDefault();
                        event.stopPropagation();

                        return false;
                    });
                    selectAllLink.insertBefore(resultsContainer);
                    this._selectAllEl = selectAllLink;

                    return _container;
                };

                HcsMulti.prototype.updateSelectAllElement = function() {
                    this._selectAllEl.removeClass("multiselect2__select-all__show");
                    if(this.results.find(".select2-no-results").length === 0) {
                        this._selectAllEl.addClass("multiselect2__select-all__show");
                    }
                };

                HcsMulti.prototype.postprocessResults = function() {
                    // call super
                    MultiSelect2.prototype.postprocessResults.apply(this, arguments);

                    this.updateSelectAllElement();
                };

                HcsMulti.prototype.updateResults = function() {
                    // call super
                    MultiSelect2.prototype.updateResults.apply(this, arguments);

                    this.updateSelectAllElement();
                };


            }]
        };
    }])
;