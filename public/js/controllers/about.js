angular.module('starter.controllers')
.controller('AboutCtrl', function($scope, $stateParams, $rootScope, api) {
		$scope.submitdata = {};

		$scope.signin = function(){
				api.verifyAdmin($scope.submitdata.admincode, $scope.submitdata.adminname).then(function(data){
						if(data){
								$rootScope.isloggedin = true;
						}else{
								$rootScope.isloggedin = false;
						}
				});
		};

		$scope.signout = function(){
				localStorage.removeItem('isloggedin');
				localStorage.removeItem('isloggedinwithname');
				localStorage.removeItem('adminname');
				$scope.isloggedin = false;
		};
});
