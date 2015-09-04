angular
    .module('zakaz-xd.demo', [
        'zakaz-xd.directives.multiselect'
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
        }
    ])
;
