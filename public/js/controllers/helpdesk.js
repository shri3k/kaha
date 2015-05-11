angular.module('starter.controllers')
.controller('HelpdeskCtrl', function($scope, $rootScope, api, $stateParams, $ionicLoading, $window, DistrictSelectService, ConstEvents) {
		$rootScope.selected = {};

		$scope.search_options = [
				{search:'#needverified', label:'Show verified needs'},
				{search:'#need', label:'Show all needs'},
				{search:'#supply', label:'Show all supplies'},
				{search:'#unverified', label:'Show unverfied resources'}
		];

		$scope.searchMenu = function(){
				this.search.value = "";
				$scope.showHide = (!$scope.showHide);
				return $scope.showHide;
		};

		$scope.selecionar = function(item){
				this.search.value = item.search;
				$scope.showHide = false;
		};

		$scope.$on('$ionicView.beforeEnter', function() {
				$scope.name = 'Kaha Helpline' 
				$rootScope.toles = [];
				$rootScope.districts = [];
				$rootScope.sectionName = $scope.name;
				var refresh = $scope.dataset?false:true;
				$scope.getData(refresh);
		});

		DistrictSelectService.createDistrictSelectorModal($scope);

		$scope.$on(ConstEvents.UPDATE_DISTRICTS, function(evnt, newSelectedDistricts) {
				$scope.currentDistricts = newSelectedDistricts;
				$rootScope.items = DistrictSelectService.filterResourcesByDistricts($scope.dataset, $scope.name, newSelectedDistricts);
		});

		$scope.$on(ConstEvents.REFRESH_DATASET, function() {
				$rootScope.doRefresh();
		});

		$scope.removeOneDistrictFilter = function(districtName) {
				DistrictSelectService.removeDistrictFilter(districtName);
		};

		$scope.clearDistrictFilters = function() {
				DistrictSelectService.clearCurrentDistricts();
		};

		$scope.showDistrictSelector = function showDistrictSelector() {
			$scope.showHide = false;
			$scope.districtModal.show();
		};

		$rootScope.updateDistrict = function(){
				//$rootScope.toles = api.location.tole($scope.dataset, $scope.name, $rootScope.selected.district);
				$rootScope.items = api.filter.location.district($scope.dataset, $scope.name, $rootScope.selected.district);
		};

		$rootScope.updateTole = function(){
				$rootScope.items = api.filter.location.tole($rootScope.items, $scope.name,  $rootScope.selected.tole);
		};

		$scope.loadItem = function(item){
				$rootScope.selectedItem = item;
				api.selected.set(item);
				window.location = "#/app/item/"+item.uuid;
		};

		$rootScope.doRefresh = function(refresh){
				$scope.getData(true);
		};

		$scope.getData = function(refresh){
			$scope.isContentReady = false;
			$ionicLoading.show({
				template: 'Loading ...',
			});

			api.data(refresh).then(function(data){
				$scope.dataset = api.filter.channel(data.content, 'need');
				$scope.currentDistricts = DistrictSelectService.getCurrentDistricts();
				$rootScope.items = DistrictSelectService.filterResourcesByDistricts($scope.dataset, $scope.name, $scope.currentDistricts);
				$rootScope.districts = api.location.districtsOnly($scope.items);
				$scope.$broadcast('scroll.refreshComplete');
			}).finally(function() {
				$scope.isContentReady = true;
				$ionicLoading.hide();
			});
		};

		$scope.print = function(){
				var p = $window.open();
				var pbody = p.document.body;
				var table = "<table style='width:100%; text-align:left; border:1px solid #ccc; border-collapse:collapse'><thead style='width:100%; text-align:left; border:1px solid #ccc; border-collapse:collapse'><th>Updated</th><th>Type</th><th>District</th><th>Tole Name</th><th>Title</th><th>Contact Name</th><th>Contact Number</th><th>Detail</th><th>Verified</th><th>Verified_by</th><th>Verification Comments</th></thead>";
				for(var i in $rootScope.items){
						var d = $rootScope.items[i];
						table = table+"<tr style='width:100%; text-align:left; border:1px solid #ccc; border-collapse:collapse'>" +
							"<td>"+(d.date ? d.date.modified : '')+"</td><td>"+d.type+"</td><td>"+d.location.district+"</td><td>"+d.location.tole+"</td><td>"+d.description.title+"</td><td>"+d.description.contactname+"</td><td>"+d.description.contactnumber+"</td><td>"+d.description.detail+"</td>" +
							"<td>"+(d.verified?d.verified:0) + "</td><td>" + (d.verified_by ? d.verified_by : '') + "</td><td>" + (d.verification_comments ? d.verification_comments : '')+ "</td>" +
							"</tr>";
				}
				table = table+"</table>";
				pbody.innerHTML = table;
		};
});
