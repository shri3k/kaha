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
    $rootScope.items = api.filter.location.tole($rootScope.items, $scope.name,  $rootScope.selected.tole);
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

.controller('ItemCtrl', function($scope, $stateParams, $rootScope, api) {
  $scope.markAsUnavailable = function(){
    api.markAsUnavailable();
  }
  $scope.requestRemove = function(){
    api.requestRemove();
  }
  $scope.editItem = function(){
    window.location = "#/app/edit";
  }
})
.controller('AboutCtrl', function($scope, $stateParams, $rootScope) {
  
})
.controller('EditCtrl', function($scope, api, $rootScope){
    console.log($rootScope.selectedItem)
    $scope.districts = api.districts.sort();
    $scope.supplytypes = api.supplytypes.sort();
    $scope.submit = function(){
     
      var error = false;
      if(!$rootScope.selectedItem.type){
        error = true;
      }
      else if(!$rootScope.selectedItem.location.district){
        error = true;
      }
      else if(!$rootScope.selectedItem.location.tole){
        error =true;
      }
      else if(!$rootScope.selectedItem.description.title){
        error = true;
      }
      else if(!$rootScope.selectedItem.description.detail){
        error = true;
      }
      else if(!$rootScope.selectedItem.description.contactname){
        error = true;
      }
      else if(!$rootScope.selectedItem.description.contactnumber){
        error = true;
      }
      if(!error){
        api.submit($rootScope.selectedItem).then(function(data){
          alert("submitted")
        });
      }
      else{
        alert("All fields are required")
      }
    }
})
.controller('SubmitCtrl', function($scope, api){
  $scope.submitdata = {};
  $scope.districts = api.districts.sort();
  $scope.supplytypes = api.supplytypes.sort();
  $scope.submit = function(){
    var data = {
                  supplytype: $scope.submitdata.supplytype, 
                  district: $scope.submitdata.district, 
                  tole: $scope.submitdata.tole, 
                  title: $scope.submitdata.title, 
                  description: "Contact Name: "+$scope.submitdata.contactname+" Contact Number: "+$scope.submitdata.contactnumber+" Description: "+$scope.submitdata.description
              };
    var error = false;
    if(!data.supplytype){
      error = true;
    }
    else if(!data.district){
      error = true;
    }
    else if(!data.tole){
      error =true;
    }
    else if(!data.title){
      error = true;
    }
    else if(!$scope.submitdata.description){
      error = true;
    }
    else if(!$scope.submitdata.contactname){
      error = true;
    }
    else if(!$scope.submitdata.contactnumber){
      error = true;
    }
    if(!error){
      api.submit(data).then(function(data){
        alert("submitted")
      });
    }
    else{
      alert("All fields are required")
    }
  }
});