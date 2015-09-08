angular
    .module('zakaz-xd.demo', [
        'zakaz-xd.directives.multiselect',
        'zakaz-xd.directives.multiselect2',
        'ui.select',
        'ui.select2',
        'ngSanitize'
    ])
    .controller('DemoCtrl', ['$scope', '$stateParams', '$state',
        function ($scope, $stateParams, $state) {
            $scope.cars = [{id:1, name: 'Audi'}, {id:2, name: 'BMW'}, {id:3, name: 'Honda'}, {id:4, name: 'Mercedes'}];
            $scope.selectedCars = [];

            $scope.generateHeader = function() {
                var txt = 'Сгенерированный header: ';
                for (var i in $scope.models.selectedCars) {
                    txt += $scope.models.selectedCars[i].name.substring(0, 1);
                }
                return txt;
            };

            $scope.changeSelection1 = function() {
                console.log("changeSelection1", $scope.models.selectedCars);
            };

            $scope.models = {};

            $scope.testChange = function(newVal) {
                console.log("test change", $scope.models.selectModel3);
            };

            $scope.select3Results = [{guid:1, name: 'Audi'}, {guid:2, name: 'BMW'}, {guid:3, name: 'Honda'}, {guid:4, name: 'Mercedes'}];
            $scope.models.selectModel3 = [$scope.select3Results[2]];
            $scope.models.selectModel2 = [{id:10, name:'test'}];
            $scope.select2Options = {
                multiple: true,
                //placeholder: "Select a cars",
                //query: function (query) {
                //    console.log(query);
                //    query.callback({ results: $scope.select3Results });
                //},
                data: {
                    results: $scope.select3Results,
                    text: function(item) {
                        return item.name;
                    }
                },
                id : function(item) {
                    return item.guid;
                },
                formatSelection: function(item) {
                    return item.name;
                },
                formatResult : function(item, container, query) {
                    return item.name;
                }
                //initSelection: function (element, callback) {
                //    var modelVal = $(element).data('$ngModelController').$modelValue;
                //    console.log("modelVal", modelVal);
                //
                //    // если данные необходимо обоготить - то делаем запрос
                //    //var id = modelVal ? modelVal.id : null;
                //    //if (id) {
                //    //    someService.getDataById(id).then(
                //    //        function(results) {
                //    //            callback(results);
                //    //        }
                //    //    );
                //    //}
                //
                //    callback(modelVal);
                //
                //}
                //,
                //initSelection: function(element, callback) {
                //    var val = $(element).select2('val'),
                //        results = [];
                //    for (var i=0; i<val.length; i++) {
                //        results.push(findState(val[i]));
                //    }
                //    callback(results);
                //}
            };

            //console.log("window.Select2", window.Select2);
        }
    ])
;
