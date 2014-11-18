var myApp = angular.module('stapp.controllers', [])

myApp.controller('MapCtrl', function($scope, $ionicLoading, $compile, $ionicPopup) {
	function initialize() {
		var myLatlng = new google.maps.LatLng(51.21968667200008,
				4.4009229560000449); // to
		// do,
		// current
		// coords

		var mapOptions = {
			center : myLatlng,
			zoom : 16,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(document.getElementById("map"),
				mapOptions);

		//						google.maps.event.addListener(marker, 'click',
		//								function() {
		//									infowindow.open(map, marker);
		//								});

		$scope.map = map;
		
		google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
			console.log("map loaded");
			$ionicLoading.hide();
		});
		
		
	}

	initialize();
	showspinner();
	
	$scope.doLogin = function() {
		console.log('Doing login', $scope.loginData);
		// Simulate a login delay. Remove this and replace with your login
		// code if using a login system
	};

	var myPopup = $ionicPopup.show({
		templateUrl : 'templates/login.html',
		title : 'Login',
		scope : $scope,
		buttons : [ {
			text : '<b>Login</b>',
			type : 'button button-large button-block button-assertive',
			onTap : $scope.doLogin
		} ]
	});

	function showspinner() {
		$ionicLoading.show({
			template : '<i class="icon ion-loading-a"></i>',
		});
	};
	

	//showspinner();

	//					$scope.centerOnMe = function() {
	//						if (!$scope.map) {
	//							return;
	//						}
	//
	//						$scope.loading = $ionicLoading.show({
	//							content : 'Getting current location...',
	//							showBackdrop : false
	//						});
	//
	//						navigator.geolocation.getCurrentPosition(
	//								function(pos) {
	//									$scope.map
	//											.setCenter(new google.maps.LatLng(
	//													pos.coords.latitude,
	//													pos.coords.longitude));
	//									$scope.loading.hide();
	//								}, function(error) {
	//									alert('Unable to get location: '
	//											+ error.message);
	//								});
	//					};
	//
	//					$scope.clickTest = function() {
	//						alert('Example of infowindow with ng-click')
	//					};

});

myApp.controller('QuestionCtrl', function($scope) {
	console.log("lalal");
})

myApp.controller('LoginCtrl', function($scope, $ionicModal, $timeout) {
	// Form data for the login modal
	$scope.loginData = {};

	// Create the login modal that we will use later
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope : $scope
	}).then(function(modal) {
		$scope.modal = modal;
	});

	// Triggered in the login modal to close it
	//	$scope.closeLogin = function() {
	//		$scope.modal.hide();
	//		// window.location.replace("/stapp/_design/app/index.html#/index");
	//	};

	// Open the login modal
	$scope.login = function() {
		$scope.modal.show();
	};

	// Perform the login action when the user submits the login form
	$scope.doLogin = function() {
		console.log('Doing login', $scope.loginData);
		// Simulate a login delay. Remove this and replace with your login
		// code if using a login system
		$timeout(function() {
			$scope.closeLogin();
		}, 1000);
	};
})
