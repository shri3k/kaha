angular.module('starter.controllers')
.controller('ItemCtrl', function($scope, $stateParams, $rootScope, api, $ionicHistory) {

	$scope.$on('$ionicView.beforeEnter', function() {
		var selectedItem = api.selected.get();

		api.data(false).then(function(data) {
			$scope.matches = api.matches.forItem(data.content, selectedItem);
		});
	});

	$rootScope.selectedItem = api.selected.get();
	$rootScope.selectedItem.channel = $rootScope.selectedItem.channel ? $rootScope.selectedItem.channel : 'supply';

	$scope.itemdata = {
		verification_comments: $rootScope.selectedItem.verification_comments ? $rootScope.selectedItem.verification_comments : '',
		verification_date : $rootScope.selectedItem.verification_date ? $rootScope.selectedItem.verification_date : ''
	};

	$scope.matches = {};
	other_channel = '';
	if ($rootScope.selectedItem.channel == 'supply') {
		$rootScope.selectedItem.activeText = $rootScope.selectedItem.active ? 'available' : 'not available';
		other_channel = 'need';
	} else {
		$rootScope.selectedItem.activeText = $rootScope.selectedItem.active ? 'needed' : 'not needed';
		other_channel = 'supply';
	}
		if (!$rootScope.selectedItem) {
				api.getItem($stateParams.uuid).then(function(data){
						if(data.success){
								$rootScope.selectedItem = data.content;
								api.stat($rootScope.selectedItem).then(function(data){
										$scope.stat = data;
								});
						}else{
								alert("no data found");
								window.location = "/";
						}
				});
		} else {
				api.stat($rootScope.selectedItem).then(function(data){
						$scope.stat = data;
				});
		}

		$scope.incrStat = function(statKey) {
				api.incrStat($rootScope.selectedItem.uuid, statKey).then(function(data) {
						if (typeof($scope.stat[statKey]) == 'undefined') {
								$scope.stat.$$statKey = 0;
						}
						var startAt = $scope.stat[statKey] ? parseInt($scope.stat[statKey]) : 0;
						$scope.stat[statKey] = startAt+1;
						api.cookie.set(statKey, $rootScope.selectedItem.uuid);
				},
				function(error) {
						alert('Error updating stat');
				});
		};

		$scope.decrStat =function(statKey){
				api.decrStat($rootScope.selectedItem.uuid, statKey).then(function(data) {
						if (typeof($scope.stat[statKey]) == 'undefined') {
								$scope.stat.$$statKey = 0;
						}
						var startAt = $scope.stat[statKey] ? parseInt($scope.stat[statKey]) : 0;
						$scope.stat[statKey] = startAt-1;
						api.cookie.remove(statKey, $rootScope.selectedItem.uuid);
				},
				function(error) {
						alert('Error updating stat');
				});
		};

		$scope.isButtonDisabled = function(key){
				return api.cookie.get(key, $rootScope.selectedItem.uuid)?true:false;
		};

		$scope.editItem = function(){
				window.location = "#/app/submit?edit=1";
		};

		$scope.verifyItem = function(state) {
			 api.verifyItem($rootScope.selectedItem, state, $rootScope.adminname, $scope.itemdata.verification_comments).then(function(data) {
					 if (data) {
							 alert('Item has been marked as Verified. Thank you');
					 }
			 });
		};

		$scope.requestDelete = function(){
				api.requestDelete($rootScope.selectedItem).then(function(data){
						if(data){
								$ionicHistory.goBack();
						}else{
								alert("Couldn't delete");
						}
				});
		};

		$scope.loadItem = function(item){
				$rootScope.selectedItem = item;
				api.selected.set(item);
				window.location = "#/app/item/"+item.uuid;
		};
});
