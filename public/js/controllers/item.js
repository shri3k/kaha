angular.module('starter.controllers')
.controller('ItemCtrl', function($scope, $stateParams, $rootScope, api, $ionicHistory) {
	$scope.selectedItem = api.selected.get($stateParams.uuid);
	$scope.selectedItem.channel = $scope.selectedItem.channel ? $scope.selectedItem.channel : 'supply';
	$scope.matches = {};

	$scope.$on('$ionicView.beforeEnter', function() {
		api.data(false).then(function(data) {
			$scope.matches = api.matches.forItem(data.content, $scope.selectedItem);
		});
	});

	//$scope.selectedItem = api.selected.get();

	$scope.itemdata = {
		verification_comments: $scope.selectedItem.verification_comments ? $scope.selectedItem.verification_comments : '',
		verification_date : $scope.selectedItem.verification_date ? $scope.selectedItem.verification_date : ''
	};

	other_channel = '';
	if ($scope.selectedItem.channel == 'supply') {
		$scope.selectedItem.activeText = $scope.selectedItem.active ? 'available' : 'not available';
		other_channel = 'need';
	} else {
		$scope.selectedItem.activeText = $scope.selectedItem.active ? 'needed' : 'not needed';
		other_channel = 'supply';
	}
		if (!$scope.selectedItem) {
				api.getItem($stateParams.uuid).then(function(data){
						if(data.success){
								$scope.selectedItem = data.content;
								api.stat($scope.selectedItem).then(function(data){
										$scope.stat = data;
								});
						}else{
								alert("no data found");
								window.location = "/";
						}
				});
		} else {
				api.stat($scope.selectedItem).then(function(data){
						$scope.stat = data;
				});
		}

		$scope.incrStat = function(statKey) {
				api.incrStat($scope.selectedItem.uuid, statKey).then(function(data) {
						if (typeof($scope.stat[statKey]) == 'undefined') {
								$scope.stat.$$statKey = 0;
						}
						var startAt = $scope.stat[statKey] ? parseInt($scope.stat[statKey]) : 0;
						$scope.stat[statKey] = startAt+1;
						api.cookie.set(statKey, $scope.selectedItem.uuid);
				},
				function(error) {
						alert('Error updating stat');
				});
		};

		$scope.decrStat =function(statKey){
				api.decrStat($scope.selectedItem.uuid, statKey).then(function(data) {
						if (typeof($scope.stat[statKey]) == 'undefined') {
								$scope.stat.$$statKey = 0;
						}
						var startAt = $scope.stat[statKey] ? parseInt($scope.stat[statKey]) : 0;
						$scope.stat[statKey] = startAt-1;
						api.cookie.remove(statKey, $scope.selectedItem.uuid);
				},
				function(error) {
						alert('Error updating stat');
				});
		};

		$scope.isButtonDisabled = function(key){
				return api.cookie.get(key, $scope.selectedItem.uuid)?true:false;
		};

		$scope.editItem = function(){
				window.location = "#/app/submit?edit=1";
		};

		$scope.verifyItem = function(state) {
			 api.verifyItem($scope.selectedItem, state, $rootScope.adminname, $scope.itemdata.verification_comments).then(function(data) {
					 if (data) {
							 alert('Item has been marked as Verified. Thank you');
					 }
			 });
		};

		$scope.requestDelete = function(){
				api.requestDelete($scope.selectedItem).then(function(data){
						if(data){
								$ionicHistory.goBack();
						}else{
								alert("Couldn't delete");
						}
				});
		};

		$scope.loadItem = function(item){
				$scope.selectedItem = item;
				api.selected.set(item);
				window.location = "#/app/item/"+item.uuid;
		};
});
