angular.module('starter.controllers')
.controller('AppCtrl', function($scope, $ionicPopover, $ionicSideMenuDelegate, $timeout, api, $rootScope) {

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

		$rootScope.popover = $ionicPopover.fromTemplate(require('../../templates/addMenu.html'), {
				scope: $rootScope,
		});

		api.init();
});
