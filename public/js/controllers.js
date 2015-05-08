angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $ionicPopover, $ionicSideMenuDelegate, $timeout, api, $timeout, $rootScope) {
    /* Disable until this is needed
    api.coordinates().then(function(position) {
            $rootScope.coordinates = position;
    },
    function(err) {
        console.error(err);
    });
    */
    if (localStorage.getItem('isloggedinwithname') !== null) {
        $rootScope.adminname = localStorage.getItem('adminname');
        $rootScope.isloggedin = (localStorage.getItem('isloggedinwithname') == 1);
    }
    setTimeout(function() {
        $ionicSideMenuDelegate.toggleLeft();
        $rootScope.isSideMenuOpen = false;
    }, 100);

    $rootScope.isAddActive = true;
    $scope.menuClicked = function() {
        $rootScope.isSideMenuOpen= $ionicSideMenuDelegate.isOpen();
    };
    $rootScope.addIconToggle = function(){
        $rootScope.isAddActive = $rootScope.isAddActive?false:true;
    };
    $rootScope.popover = $ionicPopover.fromTemplate(require('../templates/addMenu.html'), {
        scope: $rootScope,
    });
    api.init();
})
.controller('SectionCtrl', function($scope, $rootScope, api, $stateParams, $ionicLoading, $window, DistrictSelectService) {
    $rootScope.selected = {};

    $scope.search_options = [
        {search:'#needverified', label:'Show verified needs'},
        {search:'#need', label:'Show all needs'},
        {search:'#supply', label:'Show all supplies'},
        {search:'#unverified', label:'Show unverfied resources'}
    ];

    $scope.searchMenu = function(){
        $scope.search.value = "";
        return $scope.showHide=!$scope.showHide;
    };

    $scope.selecionar = function(item){
        $scope.search.value = item.search;
        $scope.showHide = false;
    };

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.name = $stateParams.sectionid;
        $rootScope.toles = [];
        $rootScope.districts = [];
        $rootScope.sectionName = $stateParams.sectionid;
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
    }

    $rootScope.updateTole = function(){
        $rootScope.items = api.filter.location.tole($rootScope.items, $scope.name,  $rootScope.selected.tole);
    }

    $scope.loadItem = function(item){
        $rootScope.selectedItem = item;
        api.selected.set(item);
        window.location = "#/app/item/"+item.uuid;
    }

    $rootScope.doRefresh = function(refresh){
        $scope.getData(true);
    }

    $scope.getData = function(refresh){
        api.data(refresh).then(function(data){
            $scope.dataset = api.filter.type(data.content, $scope.name);
            $scope.currentDistricts = DistrictSelectService.getCurrentDistricts();
            $rootScope.items = DistrictSelectService.filterResourcesByDistricts($scope.dataset, $scope.name, $scope.currentDistricts);
            $rootScope.districts = api.location.districts(data.content, $scope.name);
            $scope.$broadcast('scroll.refreshComplete');
            if ($rootScope.coordinates) {
                // Guess the district based on coordinates above and set it
                //$rootScope.selected.district = 'kathmandu';

                if($rootScope.selected.district){
                    $rootScope.updateDistrict();
                }
                if($rootScope.selected.tole){
                    $rootScope.updateTole();
                }
            }
        });
    }

    $scope.print = function(){
        var p = $window.open();
        var pbody = p.document.body;
        var table = "<table style='width:100%; text-align:left; border:1px solid #ccc; border-collapse:collapse'><thead style='width:100%; text-align:left; border:1px solid #ccc; border-collapse:collapse'><th>Type</th><th>District</th><th>Tole Name</th><th>Title</th><th>Contact Name</th><th>Contact Number</th><th>Detail</th></thead>";
        for(var i in $rootScope.items){
            var d = $rootScope.items[i];
            table = table+"<tr style='width:100%; text-align:left; border:1px solid #ccc; border-collapse:collapse'><td>"+d.type+"</td><td>"+d.location.district+"</td><td>"+d.location.tole+"</td><td>"+d.description.title+"</td><td>"+d.description.contactname+"</td><td>"+d.description.contactnumber+"</td><td>"+d.description.detail+"</td></tr>";
        }
        table = table+"</table>";
        pbody.innerHTML = table;
    }
})

.controller('ItemCtrl', function($scope, $stateParams, $rootScope, api, $ionicHistory, $stateParams) {
    $rootScope.selectedItem = api.selected.get();
    $rootScope.selectedItem.channel = $rootScope.selectedItem.channel ? $rootScope.selectedItem.channel : 'supply';
    if ($rootScope.selectedItem.channel == 'supply') {
        $rootScope.selectedItem.activeText = $rootScope.selectedItem.active ? 'available' : 'not available';
    } else {
        $rootScope.selectedItem.activeText = $rootScope.selectedItem.active ? 'needed' : 'not needed';
    }
    if(!$rootScope.selectedItem){
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
        })
    }else{
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
    }
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
    }
    $scope.isButtonDisabled = function(key){
        return api.cookie.get(key, $rootScope.selectedItem.uuid)?true:false;
    }
    $scope.editItem = function(){
        window.location = "#/app/submit?edit=1";
    }
    $scope.verifyItem = function(state) {
       api.verifyItem($rootScope.selectedItem, state, $rootScope.adminname).then(function(data) {
           if (data) {
               alert('Item has been marked as Verified. Thank you');
           }
       });
    }
    $scope.requestDelete = function(){
        api.requestDelete($rootScope.selectedItem).then(function(data){
            if(data){
                $ionicHistory.goBack();
            }else{
                alert("Couldn't delete");
            }
        });
    }
})
.controller('AboutCtrl', function($scope, $stateParams, $rootScope, api) {
    $scope.submitdata = {};
    $scope.signin = function(){
        api.verifyAdmin($scope.submitdata.admincode, $scope.submitdata.adminname).then(function(data){
            if(data){
                $rootScope.isloggedin = true;
            }else{
                $rootScope.isloggedin = false;
            }
        });
    }
    $scope.signout = function(){
        localStorage.removeItem('isloggedin');
        localStorage.removeItem('isloggedinwithname');
        localStorage.removeItem('adminname');
        $scope.isloggedin = false;
    }
})
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
    }
})
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
    }
})
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
            };
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
    }
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
            }
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
        if(!error){
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
})

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
