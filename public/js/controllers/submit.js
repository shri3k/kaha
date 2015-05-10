angular.module('starter.controllers')
.controller('SubmitCtrl', function($scope, api, $stateParams, $rootScope, $ionicHistory, $window) {

		$scope.formTitle = 'New Supply/Resource';

		$scope.submitdata = {
				channel:'supply',
				datasource:'kaha'
		};

		if ($stateParams) {
				if ($stateParams.edit) {
						//$scope.selectedItem = api.selected.get();
						if ($scope.selectedItem) {
								$scope.submitdata = {
										verified: $scope.selectedItem.verified ? $scope.selectedItem.verified : false,
										verified_by: $scope.selectedItem.verified_by ? $scope.selectedItem.verified_by : '',
										channel: $scope.selectedItem.channel ? $scope.selectedItem.channel : $scope.submitdata.channel,
										datasource: $scope.selectedItem.datasource ? $scope.selectedItem.datasource: $scope.submitdata.datasource,
										uuid: $scope.selectedItem.uuid,
										supplytype: $scope.selectedItem.type,
										district: $scope.selectedItem.location.district,
										tole: $scope.selectedItem.location.tole,
										title: $scope.selectedItem.description.title,
										contactname :$scope.selectedItem.description.contactname,
										contactnumber :$scope.selectedItem.description.contactnumber,
										description :$scope.selectedItem.description.detail
								};
						}
				} else {
						$scope.submitdata.supplytype = $stateParams.type;
				}

				if ($stateParams.channel) {
						$scope.submitdata.channel = $stateParams.channel;
						if ($stateParams.channel == 'need') {
								$scope.formTitle = 'Request Supply/Resource';
						}
				}

				if ($stateParams.datasource) {
						$scope.submitdata.datasource = $stateParams.datasource;
				}
		}

		$scope.districts = api.districts.sort();

		$scope.supplytypes = api.supplytypes.sort();

		$scope.cancel = function(){
				window.location.reload();
		};

		$scope.submit = function(confirm){
				var data = {
						datasource: $scope.submitdata.datasource,
						channel: $scope.submitdata.channel,
						type: $scope.submitdata.supplytype,
						location: {
								district: $scope.submitdata.district,
								tole: $scope.submitdata.tole,
						},
						description:{
								title: $scope.submitdata.title,
								detail: $scope.submitdata.description,
								contactname: $scope.submitdata.contactname,
								contactnumber: $scope.submitdata.contactnumber
						},
						active: true
						//description: "Contact Name: "+$scope.submitdata.contactname+" Contact Number: "+$scope.submitdata.contactnumber+" Description: "+$scope.submitdata.description
				};
				if ($scope.submitdata.uuid) {
						data.uuid = $scope.submitdata.uuid;
				}
				if ($scope.submitdata.verified) {
						data.verified = $scope.submitdata.verified;
				}
				if ($scope.submitdata.verified_by) {
						data.verified_by = $scope.submitdata.verified_by;
				}

				if ($rootScope.coordinates) {
						data.coordinates = {
							longitude : $rootScope.coordinates.longitude,
							latitude : $rootScope.coordinates.latitude
						};
				}
				var error = false;

				if(!data.type){
						error = true;
				}
				else if(!data.location.district){
						error = true;
				}
				else if(!data.location.tole){
						error =true;
				}
				else if(!data.description.title){
						error = true;
				}
				else if(!data.description.detail){
						error = true;
				}
				else if(!data.description.contactname){
						error = true;
				}
				else if(!data.description.contactnumber){
						error = true;
				}

				if (!error) {
						if (data.uuid) {
								api.update(data).then(
										function(status){
												alert("Successfully Updated");
												$rootScope.selectedItem = data;
												api.selected.set(data);
												$ionicHistory.goBack();
										},
										function(status) {
												alert("We are currently not able to process your request. Please try again later");
										}
								);
						} else {
								api.submit(data, confirm).then(
										function(status){

										if(status.status === 200){
												var response = JSON.parse(status.response);
												if(response[0]!="OK"){
														$scope.dups = response;
												}
												else{
														alert("Successfully Created");
														$window.location.reload();
												}

										}
										},
										function(status) {
												alert("We are currently not able to process your request. Please try again later");
										}
								);
						}
				}
				else{
						alert("All fields are required");
				}
		};
});
