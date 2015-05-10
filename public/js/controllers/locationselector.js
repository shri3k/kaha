angular.module('starter.controllers')
.controller('LocationSelectorCtrl', function ($scope, $rootScope, api, DistrictSelectService, ConstEvents) {
	$scope.allDistricts = DistrictSelectService.getAllDistricts();
	$scope.viewModel = {
		searchText: '',
	};

	$scope.dismiss = function() {
		$scope.districtModal.hide();
	};

	$scope.selectionChange = function() {
		var newFilterDistricts = $scope.allDistricts.filter(function(district) {
			return district.selected;
		});
		DistrictSelectService.setCurrentDistricts(newFilterDistricts);
	};

	$scope.update = function() {
		$scope.districtModal.hide();
	};
});
