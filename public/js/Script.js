//var myApp = angular.module("myModule", []);

//var myController = function ($scope) {
//    $scope.message = "Hello World";
//    var Employee = {
//        firstName: "David",
//        lastName: "Willson"
//    }
//    $scope.employee = Employee;
//}

//myApp.controller("myController", myController);


var myApp = angular
    .module("myModule", [])
    .controller("myController", function ($scope) {
        $scope.message = "Hello World";
        var Employee = {
            firstName: "David",
            lastName: "Willson"
        }
        $scope.employee = Employee;
    });
