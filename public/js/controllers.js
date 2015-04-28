angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, api) {
  
})

.controller('SectionCtrl', function($scope, $rootScope, api, $stateParams, $ionicPopup) {
  $rootScope.selected = {};
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.name = $stateParams.sectionid;
    $rootScope.selected.district = "";
    $rootScope.selected.tole = "";
    $rootScope.toles = [];
    $rootScope.districts = [];
    var refresh = $scope.dataset?false:true;
    api.data(refresh).then(function(data){
      $scope.dataset = api.filter.type(data.content, $scope.name);
      $rootScope.items = $scope.dataset;
      $rootScope.districts = api.location.districts(data.content, $scope.name);
    });
  });
  $rootScope.updateDistrict = function(){
    $rootScope.toles = api.location.tole($scope.dataset, $scope.name, $rootScope.selected.district);
    $rootScope.items = api.filter.location.district($scope.dataset, $scope.name, $rootScope.selected.district);
  }
  $rootScope.updateTole = function(){
    $rootScope.items = api.filter.location.tole($scope.dataset, $scope.name, $rootScope.selected.tole);
  }
  $scope.loadItem = function(item){
    $rootScope.selectedItem = item;
    window.location = "#/app/item";
  }
  $scope.showPopup = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        templateUrl: "templates/popup.html",
        title: 'Add Filter',
        scope: $rootScope,
        buttons: [
          {
            text: '<b>Clear Filter</b>',
            type: 'button-assertive',
            onTap: function(e) {
              $rootScope.items = $scope.dataset;
              $rootScope.selected.district = "";
              $rootScope.selected.tole = "";
            }
          },
          { text: 'Close' }
        ]
    });
  };
  $scope.doRefresh = function(){
    api.data(true).then(function(data){
      $scope.dataset = api.filter.type(data.content, $scope.name);
      $rootScope.items = $scope.dataset;
      $rootScope.districts = api.location.districts(data.content, $scope.name);
      $scope.$broadcast('scroll.refreshComplete');
      if($rootScope.selected.district){
        $rootScope.updateDistrict();
      }
      if($rootScope.selected.tole){
        $rootScope.updateTole();
      }
    });
  }
})

.controller('ItemCtrl', function($scope, $stateParams, $rootScope) {
  $scope.item = $rootScope.selectedItem;
});
