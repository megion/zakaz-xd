angular
    .module('zakaz-xd.demo2', [
        'zakaz-xd.directives.decimal',
        'zakaz-xd.directives.my-dropdown',
        'common.hcs-dropdown2',
        'zakaz-xd.directives.my.ui.mask',
        'ui.select',
        'ngSanitize',
        'ui.bootstrap'
    ])
    .controller('Demo2Ctrl', ['$scope', '$stateParams', '$state', '$modal', "$filter", "$dateParser",
        function ($scope, $stateParams, $state, $modal, $filter, $dateParser) {

            $scope.toggled = function(open) {
                console.log('Dropdown is now: ', open);
            };
        }
    ])
;
