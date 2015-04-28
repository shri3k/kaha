angular.module('starter.services', [])
.factory("api", function($q, $http){
	return{
		data:function(refresh){
			var url = "/api";
			var def = $q.defer();
			if(refresh){
				$http.get(url).success(function(data){
					if(data){
						def.resolve({success:true, content:data})
						localStorage.setItem("kahacodata", JSON.stringify(data));
					}
            	}).error(function(data, status, headers, config) {
                    def.resolve({success:false, message:"No data found"})
            	});
			}else{
				var data = JSON.parse(localStorage.getItem("kahacodata"));
				def.resolve({success:true, content: data})
			}			
            return def.promise;
		},
		filter:{
			type:function(data, type){
				var filtered = [];
				angular.forEach(data, function(item) {
			      if(type.toUpperCase() == item.type.toUpperCase()) {
			        filtered.push(item);
			      }
			    });
			    return filtered;
			}, 
			location:{
				district:function(data, type, name){
					var filtered = [];
					angular.forEach(data, function(item) {
					  if(item.location.district.toUpperCase() == name.toUpperCase() && item.type.toUpperCase() == type.toUpperCase()){
					  	filtered.push(item);
					  }
				    });
				    return filtered;
				},
				tole:function(data, type, name){
					var filtered = [];
					angular.forEach(data, function(item) {
					  if(item.location.tole.toUpperCase() == name.toUpperCase() && item.type.toUpperCase() == type.toUpperCase()){
					  	filtered.push(item);
					  }
				    });
				    return filtered;
				}
			}
		},
		location:{
			districts:function(data, type){
				var filtered = [];
				angular.forEach(data, function(item) {
				  if(filtered.indexOf(item.location.district)==-1 && item.type.toUpperCase() == type.toUpperCase()){
				  	filtered.push(item.location.district);
				  }
			    });
			    return filtered;
			},
			tole:function(data, type, district){
				var filtered = [];
				angular.forEach(data, function(item) {
				  if(item.location.district.toUpperCase() == district.toUpperCase() && item.type.toUpperCase() == type.toUpperCase()){
			      		filtered.push(item.location.tole);
				  }
			    });
			    return filtered;
			}
		}
	}
});