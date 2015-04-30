angular.module('starter.services', [])
  .factory("api", function($q, $http) {
    return {
      data: function(refresh) {
        var url = "/api";
        var def = $q.defer();
        if (refresh) {
          $http.get(url).success(function(data) {
            if (data) {
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
      submit: function(data) {
        var def = $q.defer();
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api', true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function() {
            if(this.status === 200){
                def.resolve({status:this.status});
            }
            else{
                def.fail({status:this.status});
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
                def.resolve({status:this.status});
            }
            else {
                def.fail({status:this.status});
            }
        };
        xhr.send(JSON.stringify(data));
        return def.promise;
      },
      isFirstTime:function(){
        return localStorage.getItem("kahacodata")?false:true;
      },
      requestRemove:function(data){
      	var def = $q.defer();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/'+data.uuid+'?flag=removal', true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function() {
          if(this.status === 200){
            def.resolve({success:true});
          }
        };
        xhr.send();
        return def.promise;
      },
      markAsUnavailable:function(data){
      	var def = $q.defer();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/'+data.uuid+"?flag=no", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function() {
          if(this.status === 200){
            def.resolve({success:true});
          }
        };
        xhr.send();
        return def.promise;
      },
      markHelpfull:function(data){
      	var def = $q.defer();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/'+data.uuid+"?flag=yes", true);
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
      verifyAdmin:function(val){
        var def = $q.defer();
        if(val=="c00l@dmin"){
          def.resolve(true);
        }else{
          def.resolve(false);
        }
        return def.promise;
      },
      districts: [
        "Bhaktapur", "Dhading", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Nuwakot", "Rasuwa", "Sindhupalchok", "Banke", "Bardiya", "Dailekh", "Jajarkot", "Surkhet", "Baglung", "Mustang", "Myagdi", "Parbat", "Gorkha", "Kaski", "Lamjung", "Manang", "Syangja", "Tanahu", "Dhanusa", "Dholkha", "Mahottari", "Ramechhap", "Sarlahi", "Sindhuli", "Dolpa", "Humla", "Jumla", "Kalikot", "Mugu", "Bhojpur", "Dhankuta", "Morang", "Sankhuwasabha", "Sunsari", "Terhathum", "Arghakhanchi", "Gulmi", "Kapilvastu", "Nawalparasi", "Palpa", "Rupandehi", "Baitadi", "Dadeldhura", "Darchula", "Kanchanpur", "Ilam", "Jhapa", "Panchthar", "Taplejung", "Bara", "Chitwan", "Makwanpur", "Parsa", "Rautahat", "Dang Deokhuri", "Pyuthan", "Rolpa", "Rukum", "Salyan", "Khotang", "Okhaldhunga", "Saptari", "Siraha", "Solukhumbu", "Udayapur", "Achham", "Bajhang", "Bajura", "Doti", "Kailali"
      ],
      supplytypes: ['food', 'water', 'shelter', 'blood', 'medical supplies', 'medical services', 'volunteer', 'transportation', 'other contacts']
    };

  });
