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
    api.selected.set(item);
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
  $rootScope.selectedItem = api.selected.get();
  api.stat($rootScope.selectedItem).then(function(data){
    $scope.stat = data;
  });
  $scope.markAsUnavailable = function(){
    api.markAsUnavailable($rootScope.selectedItem).then(function(data){
      var startAt = $scope.stat.no?parseInt($scope.stat.no):0;
      $scope.stat.no = startAt+1;
    });
  }
  $scope.markHelpfull = function(){
    api.markHelpfull($rootScope.selectedItem).then(function(data){
      var startAt = $scope.stat.yes?parseInt($scope.stat.yes):0;
      $scope.stat.yes = startAt+1;
    });
  }
  $scope.requestRemove = function(){
    api.requestRemove($rootScope.selectedItem);
  }
  $scope.editItem = function(){
    window.location = "#/app/edit";
  }
})
.controller('AboutCtrl', function($scope, $stateParams, $rootScope) {

})
.controller('EditCtrl', function($scope, api, $rootScope){
  $rootScope.selectedItem = api.selected.get();
   $scope.submitdata = {};
    if ($scope.selectedItem) {
        $scope.submitdata = {
            uuid: $scope.selectedItem.uuid,
            supplytype: $scope.selectedItem.type,
            district: $scope.selectedItem.location.district,
            tole: $scope.selectedItem.location.tole,
            title: $scope.selectedItem.description.title,
            contactname :$scope.selectedItem.description.contactname,
            contactnumber :$scope.selectedItem.description.contactnumber,
            description :$scope.selectedItem.description.detail
        };
           console.log('Edit ');
           console.log($scope.selectedItem)
           console.log($scope.submitdata);
    };
    $scope.districts = api.districts.sort();
    $scope.supplytypes = api.supplytypes.sort();
    $scope.submit = function(){
      var data = {
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
        if(!error) {
            api.update(data).then(function(data){
                alert("submitted");
            })
        }
        else{
            alert("All fields are required");
        }
    };
})
.controller('SubmitCtrl', function($scope, api) {
  $scope.submitdata = {};
  $scope.districts = api.districts.sort();
  $scope.supplytypes = api.supplytypes.sort();
  $scope.submit = function(){
    var data = {
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
    if(!error){
      api.submit(data).then(function(data){
        alert("submitted");
      });
    }
    else{
      alert("All fields are required");
    }
  };
}
);
