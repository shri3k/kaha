function APIService($q, $http) {
    return {
        init:function(){
          var userdata = localStorage.getItem('userdata');
          if(!userdata){
            localStorage.setItem('userdata',JSON.stringify({yes:[], no:[], no_connection:[]}));
          }
        },
        coordinates: function() {
            var def = $q.defer();
            var _key = 'local_latlon';
            var cached_position = localStorage.getItem(_key);
            if (cached_position === null) {
                function success(pos) {
                    localStorage.setItem(_key, JSON.stringify({'latitude':pos.coords.latitude, 'longitude':pos.coords.longitude}));
                    def.resolve(pos);
                };

                function error(err) {
                    def.reject(err);
                };
                if("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(success, error);
                } else {
                    def.reject('Geolocation is not available');
                }
            } else {
                var pos = JSON.parse(cached_position);
                def.resolve(pos);
            }
            return def.promise;
        },
        data: function(refresh) {
            var tagData =  function(data) {
                data = data.map(function(row){
                    row.tags = [];
                    verified = false;
                    if (row.verified === true) {
                        row.tags.push('#verified');
                        verified = true;
                    } else {
                        row.tags.push('#unverified');
                    }
                    if (row.channel === 'need') {
                        row.tags.push('#need');
                        if (verified) {
                            row.tags.push('#needverified');
                        }
                    } else {
                        row.tags.push('#supply');
                        if (verified) {
                            row.tags.push('#supplyverified');
                        }
                    }
                    return row;
                });

                return data;
            };

            var url = "/api";
            var def = $q.defer();
            if (refresh) {
                $http.get(url).success(function(data) {
                    if (data) {
                        data = tagData(data);
                        def.resolve({
                            success: true,
                            content: data
                        });
                        localStorage.setItem("kahacodata", JSON.stringify(data));
                    }
                }).error(function(data, status, headers, config) {
                    def.resolve({
                        success: false,
                        message: "No data found"
                    });
                });
            } else {
                var data = JSON.parse(localStorage.getItem("kahacodata"));
                data = tagData(data)
                def.resolve({
                    success: true,
                    content: data
                });
            }
            return def.promise;
        },
      getItem:function(uuid){
        var url = "/api";
        var def = $q.defer();
        $http.get(url).success(function(data) {
            if (data) {
              localStorage.setItem("kahacodata", JSON.stringify(data));
              for(var i in data){
                if(data[i].uuid == uuid){
                  def.resolve({success: true, content: data[i]});
                  break;
                }
              }
              def.resolve({success: false, message:"no data found"});
            }
        }).error(function(data, status, headers, config) {
            def.resolve({
              success: false,
              message: "No data found"
            });
        });
        return def.promise;
      },
      selected:{
        get:function(){
          return JSON.parse(localStorage.getItem("kahaselected"));
        },
        set:function(data){
          localStorage.setItem("kahaselected", JSON.stringify(data));
        }
      },
      filter: {
        type: function(data, type) {
          var filtered = [];
          angular.forEach(data, function(item) {
            if (type == item.type) {
              filtered.push(item);
            }
          });
          return filtered;
        },
        location: {
          district: function(data, type, name) {
            var filtered = [];
            angular.forEach(data, function(item) {
              if (item.location.district.toUpperCase() == name.toUpperCase() && item.type.toUpperCase() == type.toUpperCase()) {
                filtered.push(item);
              }
            });
            return filtered;
          },
          tole: function(data, type, name) {
            var filtered = [];
            angular.forEach(data, function(item) {
              if (item.location.tole.toUpperCase() == name.toUpperCase() && item.type.toUpperCase() == type.toUpperCase()) {
                filtered.push(item);
              }
            });
            return filtered;
          }
        }
      },
      location: {
        districts: function(data, type) {
          var filtered = [];
          angular.forEach(data, function(item) {
              if (item.location) {
                  if (filtered.indexOf(item.location.district) == -1 && item.type.toUpperCase() == type.toUpperCase()) {
                      filtered.push(item.location.district);
                  }
              }
          });
          return filtered;
        },
        tole: function(data, type, district) {
          var filtered = [];
          angular.forEach(data, function(item) {
            if (item.location.district.toUpperCase() == district.toUpperCase() && item.type.toUpperCase() == type.toUpperCase()) {
              if (filtered.indexOf(item.location.tole) == -1){
                filtered.push(item.location.tole);
              }
            }
          });
          return filtered;
        }
      },
      submit: function(data, confirm) {
        var def = $q.defer();
        var xhr = new XMLHttpRequest();
        var confirmUrlAppend = confirm?"?confirm=yes":"";
        xhr.open('POST', '/api'+confirmUrlAppend, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function() {
            if(this.status === 200){
                def.resolve(this);
            }
            else{
                def.reject(this);
            }
        };
        xhr.send(JSON.stringify(data));
        return def.promise;
      },
      update: function(data) {
        var def = $q.defer();
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', '/api', true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function() {
            if(this.status === 200){
                def.resolve(this.status);
            }
            else {
                def.reject(this.status);
            }
        };
        xhr.send(JSON.stringify(data));
        return def.promise;
      },
      isFirstTime:function(){
        return localStorage.getItem("kahacodata")?false:true;
      },
      incrStat:function(uuid, statKey) {
          var def = $q.defer();
          var xhr = new XMLHttpRequest();
          xhr.open('GET', '/api/incrflag/'+uuid+'?flag='+statKey, true);
          xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
          xhr.onload = function() {
              if(this.status === 200){
                  def.resolve(this.status);
              } else {
                  def.reject(this.status);
              }
          };
          xhr.send();
          return def.promise;
      },
      decrStat:function(uuid, statKey) {
          var def = $q.defer();
          var xhr = new XMLHttpRequest();
          xhr.open('GET', '/api/decrflag/'+uuid+'?flag='+statKey, true);
          xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
          xhr.onload = function() {
              if(this.status === 200){
                  def.resolve(this.status);
              } else {
                  def.reject(this.status);
              }
          };
          xhr.send();
          return def.promise;
      },
      verifyItem: function(data, state, admin_name){
          data.verified = state;
          data.verified_by = admin_name;
          return this.update(data);
      },
      requestDelete:function(data){
          var def = $q.defer();
          var xhr = new XMLHttpRequest();
          xhr.open('DELETE', '/api/'+data.uuid, true);
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          xhr.onload = function() {
            if(this.status === 200){
              def.resolve({success:true});
            }
            else{
              def.resolve({success:false});
            }
          };
          xhr.send();
          return def.promise;
      },
      stat:function(data){
        var def = $q.defer();
        var url = "/api/flags/"+data.uuid;
        $http.get(url).success(function(data) {
              def.resolve(data);
        });
        return def.promise;
      },
      verifyAdmin:function(val, name){
        var def = $q.defer();
        if (name && (val=="c00l@dmin")){
            localStorage.setItem('adminname', name);
            localStorage.setItem('isloggedinwithname', 1);
            def.resolve(true);
        } else {
            def.resolve(false);
        }
        return def.promise;
      },
      duplicates:function(id){
        var def = $q.defer();
        var url = "/api/dupe";
        if(typeof(id)==="undefined"){
          $http.get(url).success(function(data) {
                def.resolve(data);
          });
        }else{
          $http.get(url+"/"+id).success(function(data) {
                console.log(data);
                def.resolve(data);
          });
        }
        return def.promise;
      },
      cookie:{
        set:function(type, data){
            var userdata = JSON.parse(localStorage.getItem('userdata'));
            var typeData = userdata[type];
            if(typeData.indexOf(data)===-1){
              typeData.push(data);
            }
            userdata[type] = typeData;
            localStorage.setItem('userdata', JSON.stringify(userdata));
        },
        remove:function(type, data){
            var userdata = JSON.parse(localStorage.getItem('userdata'));
            var index = userdata[type].indexOf(data);
            if(index!==-1){
              userdata[type].splice(index, 1);
            }
            localStorage.setItem('userdata', JSON.stringify(userdata));
        },
        get:function(type, data){
            var userdata = JSON.parse(localStorage.getItem('userdata'));
            return userdata[type][userdata[type].indexOf(data)];
        }
      },
      districts: [
          "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke", "Bara", "Bardiya", "Bhaktapur", "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh", "Dang Deokhuri", "Darchula", "Dhading", "Dhankuta", "Dhanusa", "Dolakha", "Dolpa", "Doti", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla", "Kailali", "Kalikot", "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu", "Kavre", "Khotang", "Lalitpur", "Lamjung", "Mahottari", "Makwanpur", "Manang", "Morang", "Mugu", "Mustang", "Myagdi", "Nawalparasi", "Nuwakot", "Okhaldhunga", "Palpa", "Panchthar", "Parbat", "Parsa", "Pyuthan", "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rukum", "Rupandehi", "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli", "Sindhupalchowk", "Siraha", "Solukhumbu", "Sunsari", "Surkhet", "Syangja", "Tanahu", "Taplejung", "Terhathum", "Udayapur"
      ],
      supplytypes: ['food', 'water', 'shelter', 'blood', 'medical supplies', 'medical services', 'volunteer', 'transportation', 'other contacts']
    };
}

function DistrictSelectService(api, ConstEvents, $rootScope, $ionicModal) {
    var currentDistricts = _getLocalStorageDistricts();

    var allDistricts = api.districts.map(function(districtName) {
        return { 'name': districtName, 'selected': false };
    });

    function getAllDistricts() {
		return allDistricts;
    }
	function _getLocalStorageDistricts() {
		var lsd =  localStorage.getItem('currentDistricts');
		if (null === lsd) {
			return [];
		} else {
			return JSON.parse(lsd);
		}
	}

	function _setLocalStorageDistricts(districts) {
		localStorage.setItem('currentDistricts', JSON.stringify(districts));
		return districts;
	}

	function _isDistrictSelected(districtName) {
		var match = currentDistricts.filter(function(district) {
			return district.name == districtName;
		});
		return match.length !== 0;
	}

	function getCurrentDistricts() {
        return currentDistricts;
    }

    function clearCurrentDistricts() {
        allDistricts.map(function(district) {
            district.selected = false;
        });
        setCurrentDistricts([]);
        $rootScope.$broadcast(ConstEvents.REFRESH_DATASET);
    }

    function setCurrentDistricts(newDistricts) {
        currentDistricts = newDistricts;
		_setLocalStorageDistricts(newDistricts);
        $rootScope.$broadcast(ConstEvents.UPDATE_DISTRICTS, currentDistricts);
        return currentDistricts;
    }

    function removeDistrictFilter(districtName) {
        var newCurrentDistricts = currentDistricts.filter(function(district) {
            return (district.name !== districtName);
        });
        allDistricts.map(function(district) {
            if(district.name === districtName) {
              district.selected = false;
            }
            return district;
        });
        setCurrentDistricts(newCurrentDistricts);
    }

    function filterResourcesByDistricts(dataset, resourceName, districts) {
        var filteredResources = districts.reduce(function(result, selectedDistrict) {
            var filteredItems = api.filter.location.district(dataset, resourceName, selectedDistrict.name);
            return result.concat(filteredItems);
        }, []);
        if (districts.length) {
          return filteredResources;
        } else {
          return dataset;
        }
    }

    function createDistrictSelectorModal(scope) {
      return $ionicModal.fromTemplateUrl('templates/districtSelector.html', {
        scope: scope,
        animation: 'slide-in-up',
      }).then(function(modal) {
        scope.districtModal = modal;
      });
    }

    return {
        'getAllDistricts': getAllDistricts,
        'getCurrentDistricts': getCurrentDistricts,
        'setCurrentDistricts': setCurrentDistricts,
        'clearCurrentDistricts': clearCurrentDistricts,
        'filterResourcesByDistricts': filterResourcesByDistricts,
        'removeDistrictFilter': removeDistrictFilter,
        'createDistrictSelectorModal': createDistrictSelectorModal,
    };
}

var ConstEvents = {
    'UPDATE_DISTRICTS': 'UPDATE_DISTRICTS',
    'REFRESH_DATASET': 'REFRESH_DATASET',
};

angular.module('starter.services', [])
    .factory("api", APIService)
    .factory("DistrictSelectService", DistrictSelectService)
    .constant("ConstEvents", ConstEvents);
