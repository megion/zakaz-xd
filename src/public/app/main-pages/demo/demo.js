angular
    .module('zakaz-xd.demo', [
        'zakaz-xd.directives.multiselect',
        'ui.select',
        'ui.select2',
        'ngSanitize'
    ])
    .controller('DemoCtrl', ['$scope', '$stateParams', '$state',
        function ($scope, $stateParams, $state) {
            $scope.name = 'World';
            $scope.cars = [{id:1, name: 'Audi'}, {id:2, name: 'BMW'}, {id:3, name: 'Honda'}, {id:4, name: 'Mercedes'}];
            $scope.selectedCars = [];

            $scope.generateHeader = function() {
                var txt = 'Сгенерированный header: ';
                for (var i in $scope.selectedCars) {
                    txt += $scope.selectedCars[i].name.substring(0, 1);
                }
                return txt;
            };

            $scope.changeSelection1 = function() {
                console.log("changeSelection1");
            };

            $scope.models = {};

            $scope.select3Results = [{id:1, text: 'Audi'}, {id:2, text: 'BMW'}, {id:3, text: 'Honda'}, {id:4, text: 'Mercedes'}];
            $scope.select2Options = {
                multiple: true,
                placeholder: "Select a cars",
                query: function (query) {
                    query.callback({ results: $scope.select3Results });
                }//,
                //initSelection: function(element, callback) {
                //    var val = $(element).select2('val'),
                //        results = [];
                //    for (var i=0; i<val.length; i++) {
                //        results.push(findState(val[i]));
                //    }
                //    callback(results);
                //}
            };
        }
    ])
;
