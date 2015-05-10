angular.module('starter.controllers')
.controller('DuplicateItemCtrl', function($scope, $stateParams, $rootScope, api){

		$scope.$on('$ionicView.beforeEnter', function() {
				if($rootScope.isloggedin){
						$scope.name = $stateParams.itemid;
						$rootScope.toles = [];
						$rootScope.districts = [];
						$scope.dups = [];
						api.duplicates($stateParams.itemid).then(function(data){
								$scope.dups = data;
								if(data.length<2){
										window.location ="#/app/duplicatelist";
								}
						});
				}else{
						alert("Please login to access this page");
						window.location = "/";
				}
		});

		$scope.remove = function(item){
				api.requestDelete(item).then(function(){
						window.location.reload();
				});
		};
});
