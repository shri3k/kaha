angular.module('starter.controllers')
.controller('DuplicateListCtrl', function($scope, $stateParams, $rootScope, api){

		$scope.$on('$ionicView.beforeEnter', function() {
				if($rootScope.isloggedin){
						$scope.name = "Duplicate Data";
						$rootScope.toles = [];
						$rootScope.districts = [];
						api.duplicates().then(function(data){
								$scope.dups = data;
						});
				}else{
						alert("Please login to access this page");
						window.location = "/";
				}
		});

		$scope.loadItem = function(item){
				window.location = "#/app/duplicateitem/"+item;
		};
});
