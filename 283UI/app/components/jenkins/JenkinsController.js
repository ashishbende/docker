angular.module('jenkins',[])
    .controller('JenkinsController',['$scope',function($scope){
        $scope.firstName = "John";
        $scope.lastName = "Doe";
    }]);